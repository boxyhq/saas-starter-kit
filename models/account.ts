import { prisma } from '@/lib/prisma';

export const getAccount = async (key: { userId: string }) => {
  return await prisma.account.findFirst({
    where: key,
  });
};
