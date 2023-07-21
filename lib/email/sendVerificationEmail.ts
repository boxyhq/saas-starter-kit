import type { User, VerificationToken } from '@prisma/client';

import app from '../app';
import env from '../env';
import { sendEmail } from './sendEmail';

export const sendVerificationEmail = async ({
  user,
  verificationToken,
}: {
  user: User;
  verificationToken: VerificationToken;
}) => {
  const verificationLink = `${env.appUrl}/api/auth/verify-email?token=${verificationToken.token}`;

  await sendEmail({
    to: user.email,
    subject: `Confirm your ${app.name} account`,
    html: `
      <h2>Verify your email address</h2>
      <p>Thank you for signing up for ${app.name}. To confirm your account, please click the link below.</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p>If you did not create an account, no further action is required.</p>
    `,
  });
};
