import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().uuid().optional(),
  planFeature: z.string().optional(),
  order: z.number().int().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'GET': {
        const categories = await prisma.helpCategory.findMany({
          include: { children: true, _count: { select: { articles: true } } },
          orderBy: { order: 'asc' },
        });
        return res.status(200).json({ data: categories });
      }
      case 'POST': {
        const parsed = createSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: { message: parsed.error.errors[0]?.message } });
        const cat = await prisma.helpCategory.create({ data: parsed.data });
        return res.status(201).json({ data: cat });
      }
      default:
        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
