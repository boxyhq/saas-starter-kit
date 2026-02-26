import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';

/**
 * Validates that the current session user is a site admin.
 * Admin emails are configured via the ADMIN_EMAILS environment variable.
 */
export async function requireSiteAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session?.user?.id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const adminEmails = env.adminEmails;
  if (!adminEmails || adminEmails.length === 0) {
    throw new ApiError(403, 'Admin access not configured');
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true },
  });

  if (!user.email || !adminEmails.includes(user.email)) {
    throw new ApiError(403, 'Forbidden: admin access required');
  }

  return user;
}
