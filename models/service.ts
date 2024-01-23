import { prisma } from '@/lib/prisma';

export const getAllServices = async () => {
  const services = await prisma.service.findMany({});
  return services;
};
