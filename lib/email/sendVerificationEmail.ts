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
  const verificationLink = `${
    env.appUrl
  }/auth/verify-email-token?token=${encodeURIComponent(
    verificationToken.token
  )}`;

  await sendEmail({
    to: user.email,
    subject: `Confirm your ${app.name} account`,
    html: `
      <h2>Before we can get started, we need to confirm your account.</h2>
      <p>Thank you for signing up for ${app.name}. To confirm your account, please click the link below.</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p>If you did not create an account, no further action is required.</p>
    `,
  });
};
