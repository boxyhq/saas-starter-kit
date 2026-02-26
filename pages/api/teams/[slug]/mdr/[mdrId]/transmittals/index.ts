import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrNotFinal, assertMdrOwnership } from '@/lib/mdr';
import { validateWithSchema, createTransmittalSchema } from '@/lib/zod';
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

  const transmittals = await prisma.mdrTransmittal.findMany({
    where: { mdrProjectId: mdrId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { documents: true } },
    },
  });

  res.status(200).json({ data: transmittals });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'create');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');
  await assertMdrNotFinal(mdrId);

  const data = validateWithSchema(createTransmittalSchema, req.body);

  const transmittal = await prisma.mdrTransmittal.create({
    data: {
      mdrProjectId: mdrId,
      ...data,
    },
  });

  res.status(201).json({ data: transmittal });
};
