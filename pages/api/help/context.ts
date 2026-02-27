import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: { message: 'Method Not Allowed' } }); }
    const { pathname } = req.query as { pathname?: string };

    // Find articles whose pageContext pattern matches this route
    const articles = await prisma.helpArticle.findMany({
      where: {
        status: 'PUBLISHED',
        pageContext: pathname ? { not: null } : undefined,
      },
      select: { id: true, title: true, excerpt: true, slug: true, pageContext: true },
      take: 50,
    });

    const matched = pathname
      ? articles.filter((a) => {
          try {
            return new RegExp(a.pageContext!).test(pathname);
          } catch {
            return a.pageContext === pathname;
          }
        }).slice(0, 5)
      : articles.slice(0, 5);

    res.status(200).json({ data: { articles: matched, pathname: pathname ?? null } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message } });
  }
}
