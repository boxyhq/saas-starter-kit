import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import { validateWithSchema, updateTransmittalSchema } from '@/lib/zod';
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

  const { mdrId, transmittalId } = req.query as {
    mdrId: string;
    transmittalId: string;
  };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id);

  const transmittal = await prisma.mdrTransmittal.findUniqueOrThrow({
    where: { id: transmittalId, mdrProjectId: mdrId },
    include: {
      documents: { include: { document: true } },
    },
  });

  res.status(200).json({ data: transmittal });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'update');

  const { mdrId, transmittalId } = req.query as {
    mdrId: string;
    transmittalId: string;
  };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');

  const data = validateWithSchema(updateTransmittalSchema, req.body);

  const transmittal = await prisma.mdrTransmittal.update({
    where: { id: transmittalId },
    data,
  });

  res.status(200).json({ data: transmittal });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'delete');

  const { mdrId, transmittalId } = req.query as {
    mdrId: string;
    transmittalId: string;
  };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');

  const transmittal = await prisma.mdrTransmittal.findUniqueOrThrow({
    where: { id: transmittalId },
    select: { status: true },
  });

  if (transmittal.status === 'ISSUED') {
    throw new ApiError(400, 'Cannot delete an issued transmittal.');
  }

  await prisma.mdrTransmittal.delete({ where: { id: transmittalId } });

  res.status(204).end();
};
