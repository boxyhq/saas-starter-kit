import type { NextApiRequest, NextApiResponse } from 'next';

import { getUser } from 'models/user';
import { ApiError } from '@/lib/errors';
import { deleteVerificationToken } from 'models/verificationToken';
import { isAccountLocked, sendLockoutEmail } from '@/lib/accountLock';
import { resendLinkRequestSchema, validateWithSchema } from '@/lib/zod';

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
  const { email, expiredToken } = validateWithSchema(
    resendLinkRequestSchema,
    req.body
  );

  const user = await getUser({ email });

  if (!user) {
    throw new ApiError(400, 'User not found');
  }

  if (!isAccountLocked(user)) {
    throw new ApiError(
      400,
      'Your account is already active. Please try logging in.'
    );
  }

  await deleteVerificationToken(expiredToken);
  await sendLockoutEmail(user, true);

  res.status(204).end();
};
