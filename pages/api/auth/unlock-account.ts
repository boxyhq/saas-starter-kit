import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';

import { ApiError } from '@/lib/errors';
import {
  deleteVerificationToken,
  getVerificationToken,
  isVerificationTokenExpired,
} from 'models/verificationToken';
import { getUser } from 'models/user';
import { isAccountLocked, sendLockoutEmail } from '@/lib/accountLock';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'POST');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Resend unlock account email
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const resendLinkRequest = z.object({
    expiredToken: z.string(),
  });

  const { expiredToken } = resendLinkRequest.parse(req.body);

  const expiredVerificationToken = await getVerificationToken(expiredToken);

  if (!expiredVerificationToken) {
    throw new ApiError(400, 'Unauthorized request');
  }

  if (!isVerificationTokenExpired(expiredVerificationToken)) {
    throw new ApiError(400, 'Exisiting token is not expired');
  }

  await deleteVerificationToken(expiredToken);

  const user = await getUser({ email: expiredVerificationToken.identifier });

  if (!user) {
    throw new ApiError(400, 'User not found');
  }

  if (!isAccountLocked(user)) {
    throw new ApiError(
      400,
      'Your account is already unlocked. Please try logging in.'
    );
  }

  await sendLockoutEmail(user, true);

  res.status(204).end();
};
