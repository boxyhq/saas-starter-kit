import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

/**
 * Get a plan feature for a team.
 * Falls back to the default plan if the team has no active subscription.
 */
export async function getPlanFeature(
  teamId: string,
  feature: string
): Promise<{ enabled: boolean; limit: number | null }> {
  // Get the team's active subscription
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { billingId: true, mdrQuotaOverride: true },
  });

  if (!team) {
    return { enabled: false, limit: null };
  }

  let stripePriceId: string | null = null;

  if (team.billingId) {
    const subscription = await prisma.subscription.findFirst({
      where: { customerId: team.billingId, active: true },
      select: { priceId: true },
    });
    stripePriceId = subscription?.priceId ?? null;
  }

  // Find the matching plan (by stripePriceId or isDefault)
  let plan = null;

  if (stripePriceId) {
    plan = await prisma.subscriptionPlan.findFirst({
      where: { stripePriceId, isActive: true },
      include: { features: true },
    });
  }

  if (!plan) {
    plan = await prisma.subscriptionPlan.findFirst({
      where: { isDefault: true, isActive: true },
      include: { features: true },
    });
  }

  if (!plan) {
    return { enabled: false, limit: null };
  }

  const planFeature = plan.features.find((f) => f.feature === feature);

  if (!planFeature) {
    return { enabled: false, limit: null };
  }

  // Special case: if feature is mdr_projects and team has a quota override, use it
  if (feature === 'mdr_projects' && team.mdrQuotaOverride !== null) {
    return {
      enabled: true,
      limit: team.mdrQuotaOverride,
    };
  }

  return {
    enabled: planFeature.enabled,
    limit: planFeature.limit ?? null,
  };
}

/**
 * Assert that a feature is enabled for a team. Throws ApiError(402) if not.
 */
export async function assertFeatureEnabled(
  teamId: string,
  feature: string
): Promise<void> {
  const { enabled } = await getPlanFeature(teamId, feature);

  if (!enabled) {
    throw new ApiError(
      402,
      'This feature is not available on your current plan. Please upgrade to access it.'
    );
  }
}

/**
 * Check if the current usage is within the plan limit for a feature.
 * Throws ApiError(402) if the limit is exceeded.
 */
export async function checkLimit(
  teamId: string,
  feature: string,
  current: number
): Promise<void> {
  const { enabled, limit } = await getPlanFeature(teamId, feature);

  if (!enabled) {
    throw new ApiError(
      402,
      'This feature is not available on your current plan. Please upgrade to access it.'
    );
  }

  if (limit !== null && limit !== -1 && current >= limit) {
    throw new ApiError(
      402,
      `You have reached the limit of ${limit} for this feature on your current plan. Please upgrade.`
    );
  }
}
