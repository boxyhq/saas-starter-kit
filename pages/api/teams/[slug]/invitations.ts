import { sendTeamInviteEmail } from '@/lib/email/sendTeamInviteEmail';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { sendEvent } from '@/lib/svix';
import {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitations,
} from 'models/invitation';
import { addTeamMember, getTeam, isTeamAdmin } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await handleGET(req, res);
    case 'POST':
      return await handlePOST(req, res);
    case 'PUT':
      return await handlePUT(req, res);
    case 'DELETE':
      return await handleDELETE(req, res);
    default:
      res.setHeader('Allow', 'GET, POST, PUT, DELETE');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Invite a user to an team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, role } = req.body;
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug });

  if (!(await isTeamAdmin(userId, team.id))) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const invitationExists = await prisma.invitation.findFirst({
    where: {
      email,
      teamId: team.id,
    },
  });

  if (invitationExists) {
    return res.status(400).json({
      error: { message: 'An invitation already exists for this email.' },
    });
  }

  const invitation = await createInvitation({
    teamId: team.id,
    invitedBy: userId,
    email,
    role,
  });

  await sendEvent(team.id, 'invitation.created', invitation);

  await sendTeamInviteEmail(team, invitation);

  return res.status(200).json({ data: invitation });
};

// Get all invitations for an organization
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug });

  if (!(await isTeamAdmin(userId, team?.id))) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const invitations = await getInvitations(team.id);

  return res.status(200).json({ data: invitations });
};

// Delete an invitation
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.body;
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug });

  if (!(await isTeamAdmin(userId, team?.id))) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const invitation = await getInvitation({ id });

  if (invitation.invitedBy != userId || invitation.teamId != team.id) {
    return res.status(400).json({
      error: {
        message: "You don't have permission to delete this invitation.",
      },
    });
  }

  await deleteInvitation({ id });

  await sendEvent(team.id, 'invitation.removed', invitation);

  return res.status(200).json({ data: {} });
};

// Accept an invitation to an organization
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { inviteToken } = req.body as { inviteToken: string };

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const invitation = await getInvitation({ token: inviteToken });

  const teamMember = await addTeamMember(
    invitation.team.id,
    userId,
    invitation.role
  );

  await sendEvent(invitation.team.id, 'member.created', teamMember);

  await deleteInvitation({ token: inviteToken });

  return res.status(200).json({ data: {} });
};
