import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import { compilationQueue } from '@/lib/mdrQueue';
import { mdrAuditEvent } from '@/lib/mdrAudit';
import { sendMdrEvent } from '@/lib/mdrEvents';
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
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
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

  const compilations = await prisma.mdrCompilation.findMany({
    where: { mdrProjectId: mdrId },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ data: compilations });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'create');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');

  const project = await prisma.mdrProject.findUniqueOrThrow({
    where: { id: mdrId },
    select: { name: true },
  });

  const compilation = await prisma.mdrCompilation.create({
    data: {
      mdrProjectId: mdrId,
      status: 'PENDING',
    },
  });

  const job = await compilationQueue.add('compile', {
    mdrProjectId: mdrId,
    compilationId: compilation.id,
    teamId: user.team.id,
  });

  await prisma.mdrCompilation.update({
    where: { id: compilation.id },
    data: { jobId: job.id?.toString() },
  });

  await mdrAuditEvent(
    user.team.id,
    user.team.name,
    user.id,
    user.name as string,
    'mdr_compilation.triggered',
    { id: compilation.id, name: project.name, type: 'mdr_compilation' }
  );

  await sendMdrEvent(user.team.id, 'mdr.compilation.started', {
    compilationId: compilation.id,
    mdrProjectId: mdrId,
  });

  res.status(201).json({ data: compilation });
};
