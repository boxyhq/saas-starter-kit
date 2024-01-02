import { prisma } from '@/lib/prisma';

export const getAllProducts = async () => {
  const products = await prisma.stripeProduct.findMany({});
  return products;
};
