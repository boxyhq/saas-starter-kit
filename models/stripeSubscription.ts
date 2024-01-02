import { prisma } from '@/lib/prisma';

export const createStripeSubscription = async (
  customerId: string,
  subscriptionId: string,
  active: boolean,
  startDate: Date,
  endDate: Date,
  priceId: string
) => {
  const stripeSubscription = await prisma.stripeSubscription.create({
    data: {
      customerId,
      subscriptionId,
      active,
      startDate,
      endDate,
      priceId,
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

export const getByCustomerId = async (customerId: string) => {
  const stripeSubscription = await prisma.stripeSubscription.findMany({
    where: {
      customerId,
    },
  });
  return stripeSubscription;
};
