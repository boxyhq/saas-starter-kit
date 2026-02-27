import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().nullable().optional(),
  content: z.any().optional(),
  planFeature: z.string().nullable().optional(),
  pageContext: z.string().nullable().optional(),
  categoryId: z.string().uuid().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    const { articleId } = req.query as { articleId: string };
    switch (req.method) {
      case 'GET': {
        const article = await prisma.helpArticle.findUnique({
          where: { id: articleId },
          include: { category: true },
        });
        if (!article) throw new ApiError(404, 'Article not found');
        return res.status(200).json({ data: article });
      }
      case 'PATCH': {
        const parsed = patchSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: { message: parsed.error.errors[0]?.message } });
        const article = await prisma.helpArticle.update({ where: { id: articleId }, data: parsed.data });
        return res.status(200).json({ data: article });
      }
      case 'DELETE': {
        await prisma.helpArticle.delete({ where: { id: articleId } });
        return res.status(200).json({ data: { deleted: true } });
      }
      default:
        res.setHeader('Allow', 'GET, PATCH, DELETE');
        return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
