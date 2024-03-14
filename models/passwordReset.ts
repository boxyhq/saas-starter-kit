import { prisma } from '@/lib/prisma';

export const createPasswordReset = async ({ data }) => {
  return await prisma.passwordReset.create({
    data,
  });
};

export const getPasswordReset = async (token: string) => {
  return await prisma.passwordReset.findUnique({
    where: {
      token,
    },
  });
};

export const deletePasswordReset = async (token: string) => {
  return await prisma.passwordReset.delete({
    where: {
      token,
    },
  });
};
