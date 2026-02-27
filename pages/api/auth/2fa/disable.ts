import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import speakeasy from 'speakeasy';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, getAuthOptions(req, res));
    if (!session?.user) throw new ApiError(401, 'Unauthorized');

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const { token, password } = req.body as { token?: string; password?: string };

    const user = await prisma.user.findUnique({
      where: { email: (session.user as any).email },
      select: { id: true, twoFactorSecret: true, twoFactorEnabled: true, password: true },
    });
    if (!user) throw new ApiError(404, 'User not found');
    if (!user.twoFactorEnabled) throw new ApiError(400, '2FA is not enabled');

    // Require either a valid TOTP token or the account password
    let verified = false;
    if (token && user.twoFactorSecret) {
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token.replace(/\s/g, ''),
        window: 1,
      });
    } else if (password && user.password) {
      verified = await bcrypt.compare(password, user.password);
    }

    if (!verified) throw new ApiError(403, 'Invalid token or password');

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    res.status(200).json({ data: { twoFactorEnabled: false } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
