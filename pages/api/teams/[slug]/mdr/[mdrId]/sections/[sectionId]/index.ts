import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrNotFinal, assertMdrOwnership } from '@/lib/mdr';
import { validateWithSchema, updateMdrSectionSchema } from '@/lib/zod';
import { logMdrActivity } from '@/lib/mdrActivityLog';
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
  await assertMdrNotFinal(mdrId);

  const data = validateWithSchema(updateMdrSectionSchema, req.body);

  const section = await prisma.mdrSection.update({
    where: { id: sectionId },
    data,
  });

  logMdrActivity({ mdrId, userId: user.id, action: 'section_updated', details: { title: section.title } });
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
  await assertMdrNotFinal(mdrId);

  const section = await prisma.mdrSection.findUniqueOrThrow({ where: { id: sectionId }, select: { title: true } });
  await prisma.mdrSection.delete({ where: { id: sectionId } });

  logMdrActivity({ mdrId, userId: user.id, action: 'section_deleted', details: { title: section.title } });
  res.status(204).end();
};
