import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const patchSchema = z.object({
  planId: z.string().nullable(),              // null = remove override
  trialEndsAt: z.string().datetime().nullable().optional(), // ISO datetime or null = never expires
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', 'PATCH');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const { slug } = req.query as { slug: string };
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');

    const { planId, trialEndsAt } = parsed.data;

    // Verify plan exists if setting one
    if (planId !== null) {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan) throw new ApiError(404, 'Plan not found');
    }

    const team = await prisma.team.update({
      where: { slug },
      data: {
        trialPlanId: planId,
        trialEndsAt: planId === null ? null : (trialEndsAt ? new Date(trialEndsAt) : null),
      },
      select: { id: true, slug: true, trialPlanId: true, trialEndsAt: true },
    });

    res.status(200).json({ data: team });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
