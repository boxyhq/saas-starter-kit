import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { EmailVerificationRequired } from '@/lib/provisionUser';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }
  try {
    return res.status(200).json(await getSession(req, res));
  } catch (error: any) {
    return res.status(error.status || 500).json({
      error: {
        message: error.message,
        ...(error instanceof EmailVerificationRequired
          ? {
              redirectTo: '/auth/verify-email',
            }
          : {}),
      },
    });
  }
}
