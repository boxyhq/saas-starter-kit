import { prisma } from '@/lib/prisma';
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

  switch (method) {
    case 'GET':
      return await handleGET(req, res);
    case 'DELETE':
      return await handleDELETE(req, res);
    case 'PUT':
      return await handlePUT(req, res);
    case 'PATCH':
      return await handlePATCH(req, res);
    default:
      res.setHeader('Allow', 'GET, DELETE, PUT, PATCH');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get members of a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);

  if (!session) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const userId = session.user.id;
  const team = await getTeam({ slug });

  if (!(await isTeamMember(userId, team.id))) {
    return res.status(200).json({
      error: { message: 'Bad request.' },
    });
  }

  const members = await getTeamMembers(slug);

  return res.status(200).json({ data: members });
};

// Delete the member from the team
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };
  const { memberId } = req.body;

  const session = await getSession(req, res);

  if (!session) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const team = await getTeam({ slug });

  if (!(await isTeamAdmin(session.user.id, team.id))) {
    return res.status(400).json({
      error: { message: 'You are not allowed to perform this action.' },
    });
  }

  const teamMember = await removeTeamMember(team.id, memberId);

  await sendEvent(team.id, 'member.removed', teamMember);

  return res.status(200).json({ data: {} });
};

// Leave a team
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);

  if (!session) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const userId = session.user.id;
  const team = await getTeam({ slug });

  if (!(await isTeamMember(userId, team.id))) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const totalTeamOwners = await prisma.teamMember.count({
    where: {
      role: Role.OWNER,
      teamId: team.id,
    },
  });

  if (totalTeamOwners <= 1) {
    return res.status(400).json({
      error: { message: 'A team should have at least one owner.' },
    });
  }

  await removeTeamMember(team.id, userId);

  return res.status(200).json({ data: {} });
};

// Update the role of a member
const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };
  const { memberId, role } = req.body as { memberId: string; role: Role };

  const session = await getSession(req, res);

  if (!session) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const userId = session.user.id;
  const team = await getTeam({ slug });

  if (!(await isTeamAdmin(userId, team.id))) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
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

  return res.status(200).json({ data: memberUpdated });
};
