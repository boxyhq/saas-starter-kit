import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership, assertTeamNotSuspended } from '@/lib/mdr';
import env from '@/lib/env';
import * as z from 'zod';

const schema = z.object({
  sourceMdrProjectId: z.string().uuid(),
  sourceSectionId: z.string().uuid(),
});

/**
 * POST /api/teams/[slug]/mdr/[mdrId]/sections/[sectionId]/documents/assign-section
 *
 * Copies a section's document links from another MDR project into the target section.
 * Zero S3 copies — only MdrSectionDocument join rows are created.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await handlePOST(req, res);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'update');
  await assertTeamNotSuspended(user.team.id);

  const { mdrId, sectionId } = req.query as { mdrId: string; sectionId: string };
  await assertMdrOwnership(mdrId, user.team.id);

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');
  const { sourceMdrProjectId, sourceSectionId } = parsed.data;

  // Validate source project belongs to same team
  await assertMdrOwnership(sourceMdrProjectId, user.team.id);

  // Validate target section belongs to this project
  const targetSection = await prisma.mdrSection.findFirst({
    where: { id: sectionId, mdrProjectId: mdrId },
  });
  if (!targetSection) throw new ApiError(404, 'Target section not found');

  // Get all documents linked to the source section
  const sourceLinks = await prisma.mdrSectionDocument.findMany({
    where: { sectionId: sourceSectionId },
    orderBy: { order: 'asc' },
  });

  if (sourceLinks.length === 0) {
    return res.status(200).json({ data: { linked: 0 } });
  }

  // Create links in target section (upsert to avoid duplicates)
  let linked = 0;
  for (const link of sourceLinks) {
    try {
      await prisma.mdrSectionDocument.upsert({
        where: { sectionId_documentId: { sectionId, documentId: link.documentId } },
        create: { sectionId, documentId: link.documentId, order: link.order },
        update: {},
      });
      linked++;
    } catch {
      // skip if document is already linked
    }
  }

  res.status(200).json({ data: { linked } });
};
