import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const SECTION_TYPES = ['richtext', 'hero', 'features_grid', 'cta', 'testimonials', 'faq'] as const;

const createSchema = z.object({
  type: z.enum(SECTION_TYPES),
  content: z.record(z.unknown()).default({}),
  order: z.number().int().optional(),
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

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { pageId } = req.query as { pageId: string };
  const sections = await prisma.pageSection.findMany({
    where: { pageId },
    orderBy: { order: 'asc' },
  });
  res.status(200).json({ data: sections });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { pageId } = req.query as { pageId: string };
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) throw new ApiError(404, 'Page not found');

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');

  // Auto-set order to end of list if not provided
  let order = parsed.data.order;
  if (order === undefined) {
    const last = await prisma.pageSection.findFirst({
      where: { pageId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    order = (last?.order ?? -1) + 1;
  }

  const section = await prisma.pageSection.create({
    data: { pageId, type: parsed.data.type, content: parsed.data.content as Prisma.InputJsonValue, order },
  });
  res.status(201).json({ data: section });
};
