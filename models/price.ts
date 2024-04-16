import { prisma } from '@/lib/prisma';
import { Service } from '@prisma/client';

export const getAllPrices = async () => {
  return await prisma.price.findMany();
};

export const getServiceByPriceId = async (
  priceId: string
): Promise<Service | undefined> => {
  const data = await prisma.price.findUnique({
    where: {
      id: priceId,
    },
    include: {
      service: true,
    },
  });
  return data?.service;
};
