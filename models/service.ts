import { prisma } from '@/lib/prisma';

export const getAllServices = async () => {
  return await prisma.service.findMany();
};
