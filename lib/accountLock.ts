import { render } from '@react-email/components';

import app from './app';
import { User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendEmail } from './email/sendEmail';
import { createVerificationToken } from 'models/verificationToken';
import AccountLocked from '@/components/emailTemplates/AccountLocked';

const MAX_LOGIN_ATTEMPTS = 3; // TODO: Read from env
const UNLOCK_ACCOUNT_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

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
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lockedAt: new Date(),
      },
    });

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

export const unlockAccount = async (email: string) => {
  await prisma.user.update({
    where: { email },
    data: {
      invalid_login_attempts: 0,
      lockedAt: null,
    },
  });
};

export const sendLockoutEmail = async (user: User, resending = false) => {
  const verificationToken = await createVerificationToken({
    identifier: user.email,
    expires: new Date(Date.now() + UNLOCK_ACCOUNT_TOKEN_EXPIRATION),
  });

  const subject = resending
    ? `Unlock your ${app.name} account`
    : `Your ${app.name} account has been locked`;

  const token = encodeURIComponent(verificationToken.token);
  const url = `${app.url}/auth/unlock-account?token=${token}`;

  const html = render(AccountLocked({ subject, url }));

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

export const exceededLoginAttemptsThreshold = (user: User) => {
  return user.invalid_login_attempts >= MAX_LOGIN_ATTEMPTS;
};

export const isAccountLocked = (user: User) => {
  return !!user.lockedAt && exceededLoginAttemptsThreshold(user);
};
