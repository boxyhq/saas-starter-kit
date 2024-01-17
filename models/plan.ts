import { prisma } from '@/lib/prisma';

export const getAllPlans = async () => {
  const plans = await prisma.plan.findMany({});
  return plans;
};
