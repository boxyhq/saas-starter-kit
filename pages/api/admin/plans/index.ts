import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      case 'POST': await handlePOST(req, res); break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (_req: NextApiRequest, res: NextApiResponse) => {
  const plans = await prisma.subscriptionPlan.findMany({
    include: { features: { orderBy: { feature: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  });
  res.status(200).json({ data: plans });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');

  // If new plan is marked as default, clear existing default
  if (parsed.data.isDefault) {
    await prisma.subscriptionPlan.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }

  const plan = await prisma.subscriptionPlan.create({ data: parsed.data });
  res.status(201).json({ data: plan });
};
