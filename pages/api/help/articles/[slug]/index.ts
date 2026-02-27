import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: { message: 'Method Not Allowed' } }); }
    const { slug } = req.query as { slug: string };
    const article = await prisma.helpArticle.findUnique({
      where: { slug },
      include: { category: { select: { id: true, title: true, slug: true, parentId: true } } },
    });
    if (!article || article.status !== 'PUBLISHED') throw new ApiError(404, 'Article not found');
    // Increment views (fire-and-forget)
    prisma.helpArticle.update({ where: { id: article.id }, data: { views: { increment: 1 } } }).catch(() => {});
    res.status(200).json({ data: article });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message } });
  }
}
