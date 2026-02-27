import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const patchSchema = z.object({
  planId: z.string().nullable(),
  trialEndsAt: z.string().datetime().nullable().optional(),
});

/**
 * PATCH /api/admin/users/[userId]/plan
 * Assigns a plan override to all teams where this user is OWNER.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', 'PATCH');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const { userId } = req.query as { userId: string };
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');

    const { planId, trialEndsAt } = parsed.data;

    if (planId !== null) {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan) throw new ApiError(404, 'Plan not found');
    }

    // Find all teams this user owns
    const memberships = await prisma.teamMember.findMany({
      where: { userId, role: 'OWNER' },
      select: { teamId: true },
    });

    if (memberships.length === 0) {
      throw new ApiError(400, 'User is not an OWNER of any team');
    }

    const teamIds = memberships.map((m) => m.teamId);

    await prisma.team.updateMany({
      where: { id: { in: teamIds } },
      data: {
        trialPlanId: planId,
        trialEndsAt: planId === null ? null : (trialEndsAt ? new Date(trialEndsAt) : null),
      },
    });

    res.status(200).json({
      data: { updatedTeams: teamIds.length, planId, trialEndsAt: trialEndsAt ?? null },
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
