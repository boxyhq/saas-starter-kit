import { prisma } from '@/lib/prisma';

export const createStripeSubscription = async (
  stripeTeamId: string,
  subscriptionId: string,
  active: boolean,
  startDate: Date,
  endDate: Date
) => {
  const stripeSubscription = await prisma.stripeSubscription.create({
    data: {
      stripeTeamId,
      subscriptionId,
      active,
      startDate,
      endDate,
    },
  });
  return stripeSubscription;
};

export const deleteStripeSubscription = async (subscriptionId: string) => {
  const stripeSubscription = await prisma.stripeSubscription.deleteMany({
    where: {
      subscriptionId,
    },
  });
  return stripeSubscription;
};

export const updateStripeSubscription = async (
  subscriptionId: string,
  data: any
) => {
  const stripeSubscription = await prisma.stripeSubscription.updateMany({
    where: {
      subscriptionId,
    },
    data,
  });
  return stripeSubscription;
};
