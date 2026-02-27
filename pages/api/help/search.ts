import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: { message: 'Method Not Allowed' } }); }
    const { q } = req.query as { q?: string };
    if (!q || q.trim().length < 2) throw new ApiError(400, 'Query must be at least 2 characters');

    let results: any[];
    try {
      results = await prisma.$queryRaw`
        SELECT id, title, excerpt, slug,
               ts_rank("searchVector", websearch_to_tsquery('english', ${q})) as rank
        FROM "HelpArticle"
        WHERE status = 'PUBLISHED'
          AND "searchVector" @@ websearch_to_tsquery('english', ${q})
        ORDER BY rank DESC
        LIMIT 20
      `;
    } catch {
      // ILIKE fallback if searchVector not yet migrated
      results = await prisma.helpArticle.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [{ title: { contains: q, mode: 'insensitive' } }, { excerpt: { contains: q, mode: 'insensitive' } }],
        },
        select: { id: true, title: true, excerpt: true, slug: true },
        take: 20,
      });
    }

    res.status(200).json({ data: { results, query: q } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message } });
  }
}
