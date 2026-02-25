import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireSiteAdmin(req, res);
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', 'PATCH');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const { userId } = req.query as { userId: string };
    if (userId === admin.id) throw new ApiError(400, 'Cannot suspend yourself');

    const { suspended } = req.body as { suspended: boolean };
    if (typeof suspended !== 'boolean') throw new ApiError(400, 'suspended must be boolean');

    const user = await prisma.user.update({
      where: { id: userId },
      data: { suspended },
      select: { id: true, name: true, email: true, suspended: true },
    });

    res.status(200).json({ data: user });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
