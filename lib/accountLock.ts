import { render } from '@react-email/components';

import app from './app';
import { User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendEmail } from './email/sendEmail';
import AccountLocked from '@/components/emailTemplates/AccountLocked';

const MAX_LOGIN_ATTEMPTS = 3;

export const incrementLoginAttempts = async (user: User) => {
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      invalid_login_attempts: {
        increment: 1,
      },
    },
  });

  if (exceededLoginAttemptsThreshold(updatedUser)) {
    await sendLockoutEmail(user);
  }

  return updatedUser;
};

export const clearLoginAttempts = async (user: User) => {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      invalid_login_attempts: 0,
    },
  });
};

export const exceededLoginAttemptsThreshold = (user: User) => {
  return user.invalid_login_attempts >= MAX_LOGIN_ATTEMPTS;
};

export const sendLockoutEmail = async (user: User) => {
  const subject = `Your ${app.name} account has been locked`;
  const url = `${app.url}/auth/login`;

  const html = render(AccountLocked({ subject, url }));

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};
