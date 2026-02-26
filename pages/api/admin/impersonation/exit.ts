import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

/**
 * POST /api/admin/impersonation/exit
 *
 * Ends an active impersonation session and redirects back to the admin panel.
 * The session must have an impersonationToken set.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const session = await getServerSession(req, res, getAuthOptions(req, res));
    if (!session) throw new ApiError(401, 'Unauthorized');

    const { impersonationToken } = session as any;
    if (!impersonationToken) throw new ApiError(400, 'No active impersonation session');

    // Mark impersonation as used
    await prisma.adminImpersonation.updateMany({
      where: { token: impersonationToken, usedAt: null },
      data: { usedAt: new Date() },
    });

    res.status(200).json({ data: { redirectUrl: '/admin' } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
