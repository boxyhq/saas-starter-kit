import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const createSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(255),
  template: z.enum(['HOME', 'ABOUT', 'FEATURES', 'PRICING', 'BLOG_POST', 'GENERIC']).default('GENERIC'),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      case 'POST': await handlePOST(req, res); break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (_req: NextApiRequest, res: NextApiResponse) => {
  const pages = await prisma.page.findMany({
    select: {
      id: true, slug: true, title: true, template: true,
      status: true, publishedAt: true, createdAt: true, updatedAt: true,
      _count: { select: { sections: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.status(200).json({ data: pages });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');

  const existing = await prisma.page.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) throw new ApiError(409, `A page with slug "${parsed.data.slug}" already exists`);

  const page = await prisma.page.create({ data: parsed.data });
  res.status(201).json({ data: page });
};
