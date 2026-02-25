import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';
import { MdrMemberRole, Role } from '@prisma/client';

/**
 * Get the MDR project quota for a team.
 * Priority: Team.mdrQuotaOverride → active Subscription priceId → MDR_DEFAULT_LIMIT
 * -1 = unlimited
 */
export async function getMdrQuota(teamId: string): Promise<number> {
  const team = await prisma.team.findUniqueOrThrow({
    where: { id: teamId },
    select: { mdrQuotaOverride: true, billingId: true },
  });

  if (team.mdrQuotaOverride !== null && team.mdrQuotaOverride !== undefined) {
    return team.mdrQuotaOverride;
  }

  if (team.billingId) {
    const subscription = await prisma.subscription.findFirst({
      where: { customerId: team.billingId, active: true },
      select: { priceId: true },
    });

    if (subscription?.priceId) {
      const planLimit = env.mdr.planLimits[subscription.priceId];
      if (planLimit !== undefined) {
        return planLimit;
      }
    }
  }

  return env.mdr.defaultLimit;
}

/**
 * Check if a team can create more MDR projects. Throws ApiError(402) if at limit.
 */
export async function checkMdrQuota(teamId: string): Promise<void> {
  const quota = await getMdrQuota(teamId);

  if (quota === -1) return; // unlimited

  const count = await prisma.mdrProject.count({
    where: { teamId, status: { not: 'FINAL' } },
  });

  if (count >= quota) {
    throw new ApiError(
      402,
      `You have reached the maximum number of MDR projects (${quota}) on your current plan. Please upgrade to create more.`
    );
  }
}

/**
 * Assert that a user has access to an MDR project with at least the given role.
 * Team OWNERs and ADMINs bypass project-level membership checks.
 */
export async function assertMdrAccess(
  mdrProjectId: string,
  userId: string,
  teamId: string,
  minRole?: MdrMemberRole
): Promise<void> {
  // Check team-level role first — OWNER/ADMIN bypass project-level checks
  const teamMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { role: true },
  });

  if (
    teamMember &&
    (teamMember.role === Role.OWNER || teamMember.role === Role.ADMIN)
  ) {
    return; // bypass
  }

  // Check project-level membership
  const projectMember = await prisma.mdrProjectMember.findUnique({
    where: { mdrProjectId_userId: { mdrProjectId, userId } },
    select: { role: true },
  });

  if (!projectMember) {
    throw new ApiError(403, 'You do not have access to this MDR project.');
  }

  if (minRole) {
    const roleOrder: MdrMemberRole[] = ['VIEWER', 'EDITOR', 'ADMIN'];
    const userRoleIdx = roleOrder.indexOf(projectMember.role);
    const minRoleIdx = roleOrder.indexOf(minRole);

    if (userRoleIdx < minRoleIdx) {
      throw new ApiError(
        403,
        `You need at least ${minRole} access to perform this action.`
      );
    }
  }
}

/**
 * Assert that an MDR project belongs to the given team.
 */
export async function assertMdrOwnership(
  mdrProjectId: string,
  teamId: string
): Promise<void> {
  const project = await prisma.mdrProject.findFirst({
    where: { id: mdrProjectId, teamId },
    select: { id: true },
  });

  if (!project) {
    throw new ApiError(404, 'MDR project not found.');
  }
}

/**
 * Assert that a team is not suspended.
 */
export async function assertTeamNotSuspended(teamId: string): Promise<void> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { suspended: true },
  });

  if (team?.suspended) {
    throw new ApiError(
      403,
      'Your account has been suspended. Please contact support.'
    );
  }
}

/**
 * Get the MDR role for a user in a project. Returns null if not a member.
 * Team OWNER/ADMIN get 'ADMIN' role.
 */
export async function getMdrRole(
  mdrProjectId: string,
  userId: string,
  teamId: string
): Promise<MdrMemberRole | null> {
  const teamMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { role: true },
  });

  if (
    teamMember &&
    (teamMember.role === Role.OWNER || teamMember.role === Role.ADMIN)
  ) {
    return 'ADMIN';
  }

  const projectMember = await prisma.mdrProjectMember.findUnique({
    where: { mdrProjectId_userId: { mdrProjectId, userId } },
    select: { role: true },
  });

  return projectMember?.role ?? null;
}
