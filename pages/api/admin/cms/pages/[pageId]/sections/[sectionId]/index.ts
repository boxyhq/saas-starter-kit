import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const updateSchema = z.object({
  content: z.record(z.unknown()).optional(),
  order: z.number().int().optional(),
  type: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'PATCH': await handlePATCH(req, res); break;
      case 'DELETE': await handleDELETE(req, res); break;
      default:
        res.setHeader('Allow', 'PATCH, DELETE');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const getSection = async (sectionId: string, pageId: string) => {
  const section = await prisma.pageSection.findFirst({ where: { id: sectionId, pageId } });
  if (!section) throw new ApiError(404, 'Section not found');
  return section;
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const { pageId, sectionId } = req.query as { pageId: string; sectionId: string };
  await getSection(sectionId, pageId);

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');

  const section = await prisma.pageSection.update({
    where: { id: sectionId },
    data: parsed.data,
  });
  res.status(200).json({ data: section });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { pageId, sectionId } = req.query as { pageId: string; sectionId: string };
  await getSection(sectionId, pageId);
  await prisma.pageSection.delete({ where: { id: sectionId } });
  res.status(200).json({ data: { deleted: true } });
};
