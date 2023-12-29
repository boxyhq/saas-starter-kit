import { prisma } from '@/lib/prisma';

export const createStripeTeam = async (teamId: string, customerId: string) => {
  const stripeTeam = await prisma.stripeTeam.create({
    data: {
      teamId,
      customerId,
    },
  });
  return stripeTeam;
};

export const getByTeamId = async (teamId: string) => {
  return await prisma.stripeTeam.findUnique({
    where: {
      teamId,
    },
  });
};

export const getByCustomerId = async (customerId: string) => {
  return await prisma.stripeTeam.findFirstOrThrow({
    where: {
      customerId,
    },
  });
};
