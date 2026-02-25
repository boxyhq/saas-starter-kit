import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  limit: z.number().int().nullable().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', 'PATCH');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await handlePATCH(req, res);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const { planId, key } = req.query as { planId: string; key: string };

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new ApiError(404, 'Plan not found');

  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');
  if (Object.keys(parsed.data).length === 0) throw new ApiError(400, 'No fields to update');

  const feature = await prisma.planFeature.upsert({
    where: { planId_feature: { planId, feature: key } },
    create: {
      planId,
      feature: key,
      enabled: parsed.data.enabled ?? false,
      limit: parsed.data.limit ?? null,
    },
    update: parsed.data,
  });

  res.status(200).json({ data: feature });
};
