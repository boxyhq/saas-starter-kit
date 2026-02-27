import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { assertMdrOwnership } from '@/lib/mdr';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'mdr', 'read');

    const { mdrId, q } = req.query as { mdrId: string; q?: string };
    await assertMdrOwnership(mdrId, teamMember.team.id);

    if (!q || q.trim().length < 2) {
      throw new ApiError(400, 'Query must be at least 2 characters');
    }

    // Use websearch_to_tsquery for safe, user-friendly query parsing
    const results = await prisma.$queryRaw<any[]>`
      SELECT
        d.id,
        d.title,
        d."documentNumber",
        d.discipline,
        d.filename,
        d.status,
        d.revision,
        d."mdrProjectId",
        ts_rank(d."searchVector", websearch_to_tsquery('english', ${q})) AS rank
      FROM "MdrDocument" d
      WHERE
        d."mdrProjectId" = ${mdrId}
        AND d."searchVector" @@ websearch_to_tsquery('english', ${q})
      ORDER BY rank DESC
      LIMIT 50
    `;

    res.status(200).json({ data: { results, query: q } });
  } catch (error: any) {
    // Fall back to ILIKE if the searchVector column doesn't exist yet
    if (error.message?.includes('searchVector') || error.code === '42703') {
      try {
        const _teamMember = await throwIfNoTeamAccess(req, res);
        const { mdrId, q } = req.query as { mdrId: string; q: string };
        const results = await prisma.mdrDocument.findMany({
          where: {
            mdrProjectId: mdrId,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { docNumber: { contains: q, mode: 'insensitive' } },
              { originalName: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: { id: true, title: true, docNumber: true, discipline: true, originalName: true, status: true, revision: true },
          take: 50,
        });
        return res.status(200).json({ data: { results, query: q } });
      } catch {
        // ignore
      }
    }
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
