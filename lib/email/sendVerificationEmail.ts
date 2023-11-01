import type { User, VerificationToken } from '@prisma/client';
import { sendEmail } from './sendEmail';
import { render } from '@react-email/components';
import { VerificationEmail } from '@/components/emailTemplates';
import app from '../app';
import env from '../env';

export const sendVerificationEmail = async ({
  user,
  verificationToken,
}: {
  user: User;
  verificationToken: VerificationToken;
}) => {
  const subject = `Confirm your ${app.name} account`;
  const verificationLink = `${
    env.appUrl
  }/auth/verify-email-token?token=${encodeURIComponent(
    verificationToken.token
  )}`;

  const html = render(VerificationEmail({ subject, verificationLink }));

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};
