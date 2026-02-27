import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  planFeature: z.string().nullable().optional(),
  order: z.number().int().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    const { categoryId } = req.query as { categoryId: string };
    switch (req.method) {
      case 'GET': {
        const cat = await prisma.helpCategory.findUnique({
          where: { id: categoryId },
          include: { children: true, articles: { select: { id: true, title: true, status: true } } },
        });
        if (!cat) throw new ApiError(404, 'Category not found');
        return res.status(200).json({ data: cat });
      }
      case 'PATCH': {
        const parsed = patchSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: { message: parsed.error.errors[0]?.message } });
        const cat = await prisma.helpCategory.update({ where: { id: categoryId }, data: parsed.data });
        return res.status(200).json({ data: cat });
      }
      case 'DELETE': {
        await prisma.helpCategory.delete({ where: { id: categoryId } });
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
