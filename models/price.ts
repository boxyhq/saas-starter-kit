import { prisma } from '@/lib/prisma';

export const getAllPrices = async () => {
  return await prisma.price.findMany();
};
