import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', 'PATCH');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const { slug } = req.query as { slug: string };
    const { suspended } = req.body as { suspended: boolean };
    if (typeof suspended !== 'boolean') throw new ApiError(400, 'suspended must be boolean');

    const team = await prisma.team.update({
      where: { slug },
      data: { suspended },
      select: { id: true, name: true, slug: true, suspended: true },
    });

    res.status(200).json({ data: team });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
