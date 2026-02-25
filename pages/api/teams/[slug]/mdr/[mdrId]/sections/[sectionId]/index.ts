import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import { validateWithSchema, updateMdrSectionSchema } from '@/lib/zod';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'PATCH, DELETE');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'update');

  const { mdrId, sectionId } = req.query as {
    mdrId: string;
    sectionId: string;
  };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');

  const data = validateWithSchema(updateMdrSectionSchema, req.body);

  const section = await prisma.mdrSection.update({
    where: { id: sectionId },
    data,
  });

  res.status(200).json({ data: section });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'delete');

  const { mdrId, sectionId } = req.query as {
    mdrId: string;
    sectionId: string;
  };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'ADMIN');

  await prisma.mdrSection.delete({ where: { id: sectionId } });

  res.status(204).end();
};
