import { prisma } from '@/lib/prisma';

export const createStripeSubscription = async (
  customerId: string,
  id: string,
  active: boolean,
  startDate: Date,
  endDate: Date,
  priceId: string
) => {
  const subscription = await prisma.subscription.create({
    data: {
      customerId,
      id,
      active,
      startDate,
      endDate,
      priceId,
    },
  });
  return subscription;
};

export const deleteStripeSubscription = async (id: string) => {
  const subscription = await prisma.subscription.deleteMany({
    where: {
      id,
    },
  });
  return subscription;
};

export const updateStripeSubscription = async (id: string, data: any) => {
  const subscription = await prisma.subscription.updateMany({
    where: {
      id,
    },
    data,
  });
  return subscription;
};

export const getByCustomerId = async (customerId: string) => {
  const subscription = await prisma.subscription.findMany({
    where: {
      customerId,
    },
  });
  return subscription;
};
