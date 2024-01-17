import { prisma } from '@/lib/prisma';

export const getAllPrices = async () => {
  const prices = await prisma.price.findMany({});
  return prices;
};
