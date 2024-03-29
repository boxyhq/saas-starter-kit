import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/server-common';
import { VerificationToken } from '@prisma/client';

export const createVerificationToken = async ({
  identifier,
  expires,
}: Pick<VerificationToken, 'identifier' | 'expires'>) => {
  return await prisma.verificationToken.create({
    data: {
      identifier,
      expires,
      token: generateToken(),
    },
  });
};

export const getVerificationToken = async (token: string) => {
  return await prisma.verificationToken.findUnique({
    where: {
      token: decodeURIComponent(token),
    },
  });
};

export const deleteVerificationToken = async (token: string) => {
  return await prisma.verificationToken.delete({
    where: {
      token,
    },
  });
};

export const isVerificationTokenExpired = (
  verificationToken: VerificationToken
) => {
  return verificationToken.expires < new Date();
};
