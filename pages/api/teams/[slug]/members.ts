import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { sendEvent } from '@/lib/svix';
import { Role } from '@prisma/client';
import {
  getTeamMembers,
  removeTeamMember,
  throwIfNoTeamAccess,
} from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { countTeamMembers, updateTeamMember } from 'models/teamMember';
import { validateMembershipOperation } from '@/lib/rbac';
import {
  deleteMemberSchema,
  updateMemberSchema,
  validateWithSchema,
} from '@/lib/zod';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      case 'PUT':
        await handlePUT(req, res);
        break;
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, DELETE, PUT, PATCH');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get members of a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_member', 'read');

  const members = await getTeamMembers(teamMember.team.slug);

  recordMetric('member.fetched');

  res.status(200).json({ data: members });
};

// Delete the member from the team
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_member', 'delete');

  const { memberId } = validateWithSchema(
    deleteMemberSchema,
    req.query as { memberId: string }
  );

  await validateMembershipOperation(memberId, teamMember);

  const teamMemberRemoved = await removeTeamMember(teamMember.teamId, memberId);

  await sendEvent(teamMember.teamId, 'member.removed', teamMemberRemoved);

  sendAudit({
    action: 'member.remove',
    crud: 'd',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('member.removed');

  res.status(200).json({ data: {} });
};

// Leave a team
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'leave');

  /*
  Aggregate  (cost=64.62..64.63 rows=1 width=8) (actual time=0.222..0.223 rows=1 loops=1)
  ->  Bitmap Heap Scan on "TeamMember"  (cost=4.72..64.24 rows=30 width=32) (actual time=0.054..0.218 rows=32 loops=1)
        Recheck Cond: ("teamId" = '386a5102-0427-403a-b6c1-877de86d1ce0'::text)
        Filter: (role = ('OWNER'::cstring)::"Role")
        Rows Removed by Filter: 26
        Heap Blocks: exact=47
        ->  Bitmap Index Scan on "TeamMember_teamId_userId_key"  (cost=0.00..4.71 rows=58 width=0) (actual time=0.039..0.039 rows=58 loops=1)
              Index Cond: ("teamId" = '386a5102-0427-403a-b6c1-877de86d1ce0'::text)
Planning Time: 0.554 ms
Execution Time: 0.252 ms
  */

  /*
  SELECT COUNT(*) FROM 
    (
        SELECT "public"."TeamMember"."id" FROM "public"."TeamMember" WHERE (
            "public"."TeamMember"."role" = CAST('OWNER'::text AS "public"."Role") AND "public"."TeamMember"."teamId" = '7974330a-c8ca-4043-9e3c-3f326d1b6973'
        ) OFFSET 0
    ) AS "sub"
  */

  /*
Aggregate  (cost=1.03..1.04 rows=1 width=8) (actual time=0.028..0.028 rows=1 loops=1)
  ->  Seq Scan on "TeamMember"  (cost=0.00..1.02 rows=1 width=32) (actual time=0.025..0.026 rows=1 loops=1)
        Filter: (("teamId" = '7974330a-c8ca-4043-9e3c-3f326d1b6973'::text) AND (role = ('OWNER'::cstring)::"Role"))
        Rows Removed by Filter: 4
Planning Time: 0.625 ms
Execution Time: 0.057 ms
*/

  const totalTeamOwners = await countTeamMembers({
    where: {
      role: Role.OWNER,
      teamId: teamMember.teamId,
    },
  });

  if (totalTeamOwners <= 1) {
    throw new ApiError(400, 'A team should have at least one owner.');
  }

  await removeTeamMember(teamMember.teamId, teamMember.user.id);

  recordMetric('member.left');

  res.status(200).json({ data: {} });
};

// Update the role of a member
const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_member', 'update');

  const { memberId, role } = validateWithSchema(
    updateMemberSchema,
    req.body as { memberId: string; role: Role }
  );

  await validateMembershipOperation(memberId, teamMember, {
    role,
  });

  const memberUpdated = await updateTeamMember({
    where: {
      teamId_userId: {
        teamId: teamMember.teamId,
        userId: memberId,
      },
    },
    data: {
      role,
    },
  });

  sendAudit({
    action: 'member.update',
    crud: 'u',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('member.role.updated');

  res.status(200).json({ data: memberUpdated });
};
