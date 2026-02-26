import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/pages/[slug]
 * Returns a published page with its sections, ordered by section order.
 * Used by getStaticProps + ISR on public CMS pages.
 * Returns 404 if the page is not found or not PUBLISHED.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
  }

  const { slug } = req.query as { slug: string };

  const page = await prisma.page.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: { sections: { orderBy: { order: 'asc' } } },
  });

  if (!page) {
    return res.status(404).json({ error: { message: 'Page not found' } });
  }

  // Cache for 60 seconds at CDN level
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).json({ data: page });
}
