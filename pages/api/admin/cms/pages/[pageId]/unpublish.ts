import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    const { pageId } = req.query as { pageId: string };
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new ApiError(404, 'Page not found');

    const updated = await prisma.page.update({
      where: { id: pageId },
      data: { status: 'DRAFT' },
    });
    res.status(200).json({ data: updated });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
