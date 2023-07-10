import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { sendAudit } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import { sendEvent } from '@/lib/svix';
import { Role } from '@prisma/client';
import {
  getTeam,
  getTeamMembers,
  isTeamAdmin,
  isTeamMember,
  removeTeamMember,
} from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

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
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const team = await getTeam({ slug });

  if (!(await isTeamMember(session.user.id, team.id))) {
    throw new ApiError(400, 'Bad request');
  }

  const members = await getTeamMembers(slug);

  res.status(200).json({ data: members });
};

// Delete the member from the team
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug, memberId } = req.query as { slug: string; memberId: string };

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const team = await getTeam({ slug });

  if (!(await isTeamAdmin(session.user.id, team.id))) {
    throw new ApiError(400, 'You are not allowed to perform this action.');
  }

  const teamMember = await removeTeamMember(team.id, memberId);

  await sendEvent(team.id, 'member.removed', teamMember);

  sendAudit({
    action: 'member.remove',
    crud: 'd',
    user: session.user,
    team,
  });

  res.status(200).json({ data: {} });
};

// Leave a team
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const team = await getTeam({ slug });

  if (!(await isTeamMember(session.user.id, team.id))) {
    throw new ApiError(400, 'Bad request.');
  }

  const totalTeamOwners = await prisma.teamMember.count({
    where: {
      role: Role.OWNER,
      teamId: team.id,
    },
  });

  if (totalTeamOwners <= 1) {
    throw new ApiError(400, 'A team should have at least one owner.');
  }

  await removeTeamMember(team.id, session.user.id);

  res.status(200).json({ data: {} });
};

// Update the role of a member
const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };
  const { memberId, role } = req.body as { memberId: string; role: Role };

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const team = await getTeam({ slug });

  if (!(await isTeamAdmin(session.user.id, team.id))) {
    throw new ApiError(400, 'Bad request.');
  }

  const memberUpdated = await prisma.teamMember.update({
    where: {
      teamId_userId: {
        teamId: team.id,
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
    user: session.user,
    team,
  });

  res.status(200).json({ data: memberUpdated });
};
