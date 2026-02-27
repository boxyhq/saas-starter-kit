import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, getAuthOptions(req, res));
    if (!session?.user) throw new ApiError(401, 'Unauthorized');

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const user = await prisma.user.findUnique({
      where: { email: (session.user as any).email },
      select: { id: true, twoFactorEnabled: true, email: true, name: true },
    });
    if (!user) throw new ApiError(404, 'User not found');
    if (user.twoFactorEnabled) throw new ApiError(400, '2FA is already enabled');

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `SaaS:${user.email}`,
    });

    // Store secret temporarily (unverified — will be confirmed on verify)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 },
    });

    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

    res.status(200).json({
      data: {
        secret: secret.base32,
        qrDataUrl,
        otpauthUrl: secret.otpauth_url,
      },
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
