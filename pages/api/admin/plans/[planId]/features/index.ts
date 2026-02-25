import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const featureSchema = z.object({
  feature: z.string().min(1),
  enabled: z.boolean(),
  limit: z.number().int().nullable().optional(),
});

const bulkSchema = z.array(featureSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      case 'PUT': await handlePUT(req, res); break;
      default:
        res.setHeader('Allow', 'GET, PUT');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { planId } = req.query as { planId: string };
  const features = await prisma.planFeature.findMany({
    where: { planId },
    orderBy: { feature: 'asc' },
  });
  res.status(200).json({ data: features });
};

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { planId } = req.query as { planId: string };

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new ApiError(404, 'Plan not found');

  const parsed = bulkSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');

  // Bulk upsert all feature rows
  const results = await prisma.$transaction(
    parsed.data.map((f) =>
      prisma.planFeature.upsert({
        where: { planId_feature: { planId, feature: f.feature } },
        create: { planId, feature: f.feature, enabled: f.enabled, limit: f.limit ?? null },
        update: { enabled: f.enabled, limit: f.limit ?? null },
      })
    )
  );

  res.status(200).json({ data: results });
};
