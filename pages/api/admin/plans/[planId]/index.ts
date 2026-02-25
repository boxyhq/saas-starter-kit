import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  stripeProductId: z.string().nullable().optional(),
  stripePriceId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      case 'PATCH': await handlePATCH(req, res); break;
      case 'DELETE': await handleDELETE(req, res); break;
      default:
        res.setHeader('Allow', 'GET, PATCH, DELETE');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const getPlan = async (planId: string) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    include: { features: { orderBy: { feature: 'asc' } } },
  });
  if (!plan) throw new ApiError(404, 'Plan not found');
  return plan;
};

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { planId } = req.query as { planId: string };
  const plan = await getPlan(planId);
  res.status(200).json({ data: plan });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const { planId } = req.query as { planId: string };
  await getPlan(planId);

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');

  // If this plan is being set as default, clear existing defaults
  if (parsed.data.isDefault) {
    await prisma.subscriptionPlan.updateMany({
      where: { isDefault: true, id: { not: planId } },
      data: { isDefault: false },
    });
  }

  const plan = await prisma.subscriptionPlan.update({
    where: { id: planId },
    data: parsed.data,
    include: { features: true },
  });
  res.status(200).json({ data: plan });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { planId } = req.query as { planId: string };
  const plan = await getPlan(planId);

  if (plan.isDefault) throw new ApiError(400, 'Cannot delete the default plan');

  await prisma.subscriptionPlan.delete({ where: { id: planId } });
  res.status(200).json({ data: { deleted: true } });
};
