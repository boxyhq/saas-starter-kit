import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

    await throwIfNoTeamAccess(req, res);
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, 'mdr', 'read');

    const { mdrId, sectionId } = req.query as {
      mdrId: string;
      sectionId?: string;
    };
    await assertMdrOwnership(mdrId, user.team.id);
    await assertMdrAccess(mdrId, user.id, user.team.id);

    const docs = await prisma.mdrDocument.findMany({
      where: {
        mdrProjectId: mdrId,
        ...(sectionId
          ? { sectionLinks: { some: { sectionId } } }
          : {}),
      },
      orderBy: { uploadedAt: 'desc' },
      include: {
        sectionLinks: {
          include: { section: { select: { id: true, title: true } } },
        },
      },
    });

    res.status(200).json({ data: docs });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
