import { generateToken, validateEmail } from '@/lib/common';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';
import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { validateRecaptcha } from '@/lib/recaptcha';

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

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, recaptchaToken } = req.body;

  await validateRecaptcha(recaptchaToken);

  if (!email || !validateEmail(email)) {
    throw new ApiError(422, 'The e-mail address you entered is invalid');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(422, `We can't find a user with that e-mail address`);
  }

  const resetToken = generateToken();

  await prisma.passwordReset.create({
    data: {
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expires in 1 hour
    },
  });

  await sendPasswordResetEmail(user, encodeURIComponent(resetToken));

  recordMetric('user.password.request');

  res.json({});
};
