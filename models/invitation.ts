import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { Invitation } from '@prisma/client';
import { randomUUID } from 'crypto';

export type TeamInvitation = Pick<
  Invitation,
  'id' | 'email' | 'role' | 'expires' | 'allowedDomains' | 'token'
> & { url: string };

/*
Bitmap Heap Scan on "Invitation"  (cost=4.16..9.51 rows=1 width=168) (actual time=0.133..0.138 rows=4 loops=1)
  Recheck Cond: ("teamId" = '12b885f6-dcd9-4b26-b27c-b3c8cf968786'::text)
  Filter: "sentViaEmail"
  Heap Blocks: exact=1
  ->  Bitmap Index Scan on "Invitation_teamId_email_key"  (cost=0.00..4.16 rows=2 width=0) (actual time=0.096..0.096 rows=4 loops=1)
        Index Cond: ("teamId" = '12b885f6-dcd9-4b26-b27c-b3c8cf968786'::text)
Planning Time: 0.984 ms
Execution Time: 0.219 ms
*/

/*
SELECT 
  "public"."Invitation"."id", 
  "public"."Invitation"."email", 
  "public"."Invitation"."role"::text, 
  "public"."Invitation"."expires", 
  "public"."Invitation"."token", 
  "public"."Invitation"."allowedDomains" 
FROM "public"."Invitation" 
WHERE ("public"."Invitation"."teamId" = '7974330a-c8ca-4043-9e3c-3f326d1b6973' AND "public"."Invitation"."sentViaEmail" = true) OFFSET 0
*/

/**
  Bitmap Heap Scan on "Invitation"  (cost=4.16..9.51 rows=1 width=168) (actual time=0.019..0.020 rows=3 loops=1)
  Recheck Cond: ("teamId" = '7974330a-c8ca-4043-9e3c-3f326d1b6973'::text)
  Filter: "sentViaEmail"
  Heap Blocks: exact=1
  ->  Bitmap Index Scan on "Invitation_teamId_idx"  (cost=0.00..4.16 rows=2 width=0) (actual time=0.006..0.006 rows=4 loops=1)
        Index Cond: ("teamId" = '7974330a-c8ca-4043-9e3c-3f326d1b6973'::text)
  Planning Time: 0.225 ms
  Execution Time: 0.041 ms
 */
export const getInvitations = async (teamId: string, sentViaEmail: boolean) => {
  const invitations = await prisma.invitation.findMany({
    where: {
      teamId,
      sentViaEmail,
    },
    select: {
      id: true,
      email: true,
      role: true,
      expires: true,
      token: true,
      allowedDomains: true,
    },
  });

  return invitations.map((invitation) => ({
    ...invitation,
    url: `${env.appUrl}/invitations/${invitation.token}`,
  })) as (Invitation & { url: string })[];
};

export const getInvitation = async (
  key: { token: string } | { id: string }
) => {
  const invitation = await prisma.invitation.findUnique({
    where: key,
    include: {
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new ApiError(404, 'Invitation not found.');
  }

  return invitation;
};

export const createInvitation = async (
  params: Omit<
    Invitation,
    'id' | 'token' | 'expires' | 'createdAt' | 'updatedAt'
  >
) => {
  const data: Omit<Invitation, 'id' | 'createdAt' | 'updatedAt'> = {
    ...params,
    token: randomUUID(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  return await prisma.invitation.create({
    data,
  });
};

export const deleteInvitation = async (
  key: { token: string } | { id: string }
) => {
  return await prisma.invitation.delete({
    where: key,
  });
};

export const isInvitationExpired = async (expires: Date) => {
  return expires.getTime() < Date.now();
};

export const getInvitationCount = async ({ where }) => {
  return await prisma.invitation.count({
    where,
  });
};
