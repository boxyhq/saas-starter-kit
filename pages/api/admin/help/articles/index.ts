import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const createSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional(),
  content: z.any(),
  planFeature: z.string().optional(),
  pageContext: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'GET': {
        const { q, categoryId, status, page = '1', limit = '50' } = req.query as Record<string, string>;
        const take = Math.min(parseInt(limit), 100);
        const skip = (parseInt(page) - 1) * take;
        const where: any = {};
        if (categoryId) where.categoryId = categoryId;
        if (status) where.status = status;
        if (q) where.OR = [{ title: { contains: q, mode: 'insensitive' } }, { excerpt: { contains: q, mode: 'insensitive' } }];
        const [articles, total] = await Promise.all([
          prisma.helpArticle.findMany({
            where,
            select: { id: true, title: true, slug: true, status: true, views: true, helpful: true, notHelpful: true, createdAt: true, updatedAt: true, category: { select: { id: true, title: true } } },
            orderBy: { updatedAt: 'desc' },
            take,
            skip,
          }),
          prisma.helpArticle.count({ where }),
        ]);
        return res.status(200).json({ data: { articles, total, page: parseInt(page), limit: take } });
      }
      case 'POST': {
        const parsed = createSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: { message: parsed.error.errors[0]?.message } });
        const article = await prisma.helpArticle.create({ data: { ...parsed.data, content: parsed.data.content ?? {} } });
        return res.status(201).json({ data: article });
      }
      default:
        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
