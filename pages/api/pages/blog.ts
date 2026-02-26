import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/pages/blog
 * Returns all published BLOG_POST pages ordered by publishedAt desc.
 * Used by getStaticProps + ISR on the blog list page.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
  }

  const posts = await prisma.page.findMany({
    where: { status: 'PUBLISHED', template: 'BLOG_POST' },
    select: {
      id: true,
      slug: true,
      title: true,
      seoDesc: true,
      publishedAt: true,
      _count: { select: { sections: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).json({ data: posts });
}
