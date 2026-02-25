import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';

/**
 * GET /api/teams/[slug]/mdr/[mdrId]/documents/library
 *
 * Returns all documents across ALL team MDR projects, for cross-MDR linking.
 * Excludes documents that are already linked to this project.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, 'mdr', 'read');

    const { mdrId, q } = req.query as { mdrId: string; q?: string };

    const documents = await prisma.mdrDocument.findMany({
      where: {
        teamId: user.team.id,
        mdrProjectId: { not: mdrId },
        ...(q ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { docNumber: { contains: q, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: {
        mdrProject: { select: { id: true, name: true } },
        sectionLinks: { include: { section: { select: { id: true, title: true } } } },
      },
      orderBy: [{ mdrProjectId: 'asc' }, { docNumber: 'asc' }],
      take: 100,
    });

    res.status(200).json({ data: documents });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
