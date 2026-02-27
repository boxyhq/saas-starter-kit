import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership, assertMdrNotFinal } from '@/lib/mdr';
import { validateWithSchema, updateMdrProjectSchema } from '@/lib/zod';
import { mdrAuditEvent } from '@/lib/mdrAudit';
import { cleanupQueue } from '@/lib/mdrQueue';
import { logMdrActivity } from '@/lib/mdrActivityLog';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, PATCH, DELETE');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'read');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id);

  const project = await prisma.mdrProject.findUniqueOrThrow({
    where: { id: mdrId },
    include: {
      _count: {
        select: { sections: true, members: true, compilations: true },
      },
      compilations: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  res.status(200).json({ data: project });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'update');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'ADMIN');

  const data = validateWithSchema(updateMdrProjectSchema, req.body);

  // Fetch current status so we can validate the transition
  const current = await prisma.mdrProject.findUniqueOrThrow({
    where: { id: mdrId },
    select: { status: true, name: true },
  });

  if (data.status !== undefined) {
    // FINAL is irreversible
    if (current.status === 'FINAL') {
      throw new ApiError(409, 'A finalized project cannot be reopened.');
    }
    // Finalizing requires a disposition choice
    if (data.status === 'FINAL' && !data.finalizeOption) {
      throw new ApiError(
        400,
        'finalizeOption (KEEP or ARCHIVE) is required when finalizing a project.'
      );
    }
  }

  const project = await prisma.mdrProject.update({
    where: { id: mdrId },
    data,
  });

  const isFinalizing = data.status === 'FINAL';

  // Enqueue background cleanup when transitioning to FINAL
  if (isFinalizing && data.finalizeOption) {
    await cleanupQueue.add('finalize_project', {
      type: 'finalize_project',
      mdrProjectId: mdrId,
      teamId: user.team.id,
      keepSourceDocs: data.finalizeOption === 'KEEP',
    });
  }

  await mdrAuditEvent(
    user.team.id,
    user.team.name,
    user.id,
    user.name as string,
    isFinalizing ? 'mdr_project.finalized' : 'mdr_project.updated',
    { id: mdrId, name: project.name, type: 'mdr_project' }
  );

  logMdrActivity({ mdrId, userId: user.id, action: isFinalizing ? 'project_finalized' : 'project_updated', details: { name: project.name } });

  res.status(200).json({ data: project });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'delete');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'ADMIN');

  const project = await prisma.mdrProject.findUniqueOrThrow({
    where: { id: mdrId },
    select: { name: true },
  });

  // Enqueue S3 cleanup before deleting DB records
  await cleanupQueue.add('delete_project', {
    type: 'delete_project',
    mdrProjectId: mdrId,
    teamId: user.team.id,
  });

  await prisma.mdrProject.delete({ where: { id: mdrId } });

  await mdrAuditEvent(
    user.team.id,
    user.team.name,
    user.id,
    user.name as string,
    'mdr_project.deleted',
    { id: mdrId, name: project.name, type: 'mdr_project' }
  );

  res.status(204).end();
};
