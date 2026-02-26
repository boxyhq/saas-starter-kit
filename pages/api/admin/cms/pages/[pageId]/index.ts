import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]*$/).optional(),
  seoTitle: z.string().nullable().optional(),
  seoDesc: z.string().nullable().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      case 'PATCH': await handlePATCH(req, res); break;
      case 'DELETE': await handleDELETE(req, res); break;
      default:
        res.setHeader('Allow', 'GET, PATCH, DELETE');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const getPage = async (pageId: string) => {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
  if (!page) throw new ApiError(404, 'Page not found');
  return page;
};

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const page = await getPage(req.query.pageId as string);
  res.status(200).json({ data: page });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const { pageId } = req.query as { pageId: string };
  await getPage(pageId);

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');

  if (parsed.data.slug) {
    const conflict = await prisma.page.findFirst({
      where: { slug: parsed.data.slug, id: { not: pageId } },
    });
    if (conflict) throw new ApiError(409, `Slug "${parsed.data.slug}" is already in use`);
  }

  const page = await prisma.page.update({
    where: { id: pageId },
    data: parsed.data,
    include: { sections: { orderBy: { order: 'asc' } } },
  });
  res.status(200).json({ data: page });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { pageId } = req.query as { pageId: string };
  await getPage(pageId);
  await prisma.page.delete({ where: { id: pageId } });
  res.status(200).json({ data: { deleted: true } });
};
