import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import speakeasy from 'speakeasy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, getAuthOptions(req, res));
    if (!session?.user) throw new ApiError(401, 'Unauthorized');

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const { token } = req.body as { token: string };
    if (!token) throw new ApiError(400, 'Token is required');

    const user = await prisma.user.findUnique({
      where: { email: (session.user as any).email },
      select: { id: true, twoFactorSecret: true, twoFactorEnabled: true },
    });
    if (!user) throw new ApiError(404, 'User not found');
    if (!user.twoFactorSecret) throw new ApiError(400, 'Run /api/auth/2fa/setup first');

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''),
      window: 1,
    });

    if (!valid) throw new ApiError(400, 'Invalid token — please try again');

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    res.status(200).json({ data: { twoFactorEnabled: true } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
