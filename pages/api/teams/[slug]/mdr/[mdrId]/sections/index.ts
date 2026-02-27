import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrNotFinal, assertMdrOwnership } from '@/lib/mdr';
import {
  validateWithSchema,
  createMdrSectionSchema,
  reorderSectionsSchema,
} from '@/lib/zod';
import env from '@/lib/env';
import { logMdrActivity } from '@/lib/mdrActivityLog';

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
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST, PATCH');
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

  const sections = await prisma.mdrSection.findMany({
    where: { mdrProjectId: mdrId },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { documentLinks: true, children: true } },
    },
  });

  res.status(200).json({ data: sections });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'create');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');
  await assertMdrNotFinal(mdrId);

  const data = validateWithSchema(createMdrSectionSchema, req.body);

  // Calculate next order
  const maxOrder = await prisma.mdrSection.aggregate({
    where: {
      mdrProjectId: mdrId,
      parentSectionId: data.parentSectionId ?? null,
    },
    _max: { order: true },
  });

  const section = await prisma.mdrSection.create({
    data: {
      mdrProjectId: mdrId,
      title: data.title,
      parentSectionId: data.parentSectionId ?? null,
      docNumberFormat: data.docNumberFormat,
      requiredDocCount: data.requiredDocCount ?? 0,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  logMdrActivity({ mdrId, userId: user.id, action: 'section_created', details: { title: section.title } });
  res.status(201).json({ data: section });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'update');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');
  await assertMdrNotFinal(mdrId);

  // Reorder sections
  const { orderedIds } = validateWithSchema(reorderSectionsSchema, req.body);

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.mdrSection.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  res.status(200).json({ data: { success: true } });
};
