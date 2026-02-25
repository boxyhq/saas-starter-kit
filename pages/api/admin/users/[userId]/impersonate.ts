import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireSiteAdmin(req, res);
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const { userId } = req.query as { userId: string };
    if (userId === admin.id) throw new ApiError(400, 'Cannot impersonate yourself');

    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!target) throw new ApiError(404, 'User not found');

    // Create impersonation token (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const record = await prisma.adminImpersonation.create({
      data: {
        adminUserId: admin.id,
        targetUserId: userId,
        expiresAt,
      },
    });

    const redirectUrl = `/admin/impersonate/start?token=${record.token}`;
    res.status(200).json({ data: { redirectUrl, token: record.token } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
