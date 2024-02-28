import { validateEmail } from '@/lib/server-common';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { ApiError } from '@/lib/errors';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from 'models/user';
import { createVerificationToken } from 'models/verificationToken';

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
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    throw new ApiError(422, 'The email address you entered is invalid');
  }

  const user = await getUser({ email });

  if (!user) {
    throw new ApiError(422, `We can't find a user with that e-mail address`);
  }

  const newVerificationToken = await createVerificationToken({
    identifier: email,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours),
  });

  await sendVerificationEmail({
    user,
    verificationToken: newVerificationToken,
  });
  res.json({});
};
