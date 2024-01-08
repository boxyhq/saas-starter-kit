import { sendTeamInviteEmail } from '@/lib/email/sendTeamInviteEmail';
import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { sendAudit } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import { sendEvent } from '@/lib/svix';
import {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitations,
  isInvitationExpired,
} from 'models/invitation';
import { addTeamMember, throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { isEmailAllowed } from '@/lib/email/utils';
import { Invitation } from '@prisma/client';

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
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'PUT':
        await handlePUT(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST, PUT, DELETE');
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

// Invite a user to a team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_invitation', 'create');

  const { email, role, sentViaEmail, domains } = req.body;
  let invitation: null | Invitation = null;

  // Invite via email
  if (email && sentViaEmail) {
    if (!isEmailAllowed(email)) {
      throw new ApiError(
        400,
        'It seems you entered a non-business email. Invitations can only be sent to work emails.'
      );
    }

    const memberExists = await prisma.teamMember.count({
      where: {
        teamId: teamMember.teamId,
        user: {
          email,
        },
      },
    });

    if (memberExists) {
      throw new ApiError(400, 'This user is already a member of the team.');
    }

    const invitationExists = await prisma.invitation.count({
      where: {
        email,
        teamId: teamMember.teamId,
      },
    });

    if (invitationExists) {
      throw new ApiError(400, 'An invitation already exists for this email.');
    }

    invitation = await createInvitation({
      teamId: teamMember.teamId,
      invitedBy: teamMember.userId,
      email,
      role,
      sentViaEmail: true,
      allowedDomain: [],
    });

    await sendEvent(teamMember.teamId, 'invitation.created', invitation);
    await sendTeamInviteEmail(teamMember.team, invitation);
  }

  // Invite via link
  if (!sentViaEmail) {
    invitation = await createInvitation({
      teamId: teamMember.teamId,
      invitedBy: teamMember.userId,
      role,
      email: null,
      sentViaEmail: true,
      allowedDomain: domains
        ? domains.split(',').map((d) => d.trim().toLowerCase())
        : [],
    });
  }

  if (!invitation) {
    throw new ApiError(400, `Couldn't create invitation. Please try again.`);
  }

  sendAudit({
    action: 'member.invitation.create',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('invitation.created');

  const data = {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    expires: invitation.expires,
    sentViaEmail: invitation.sentViaEmail,
    allowedDomain: invitation.allowedDomain,
  };

  res.status(200).json({ data });
};

// Get all invitations for a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_invitation', 'read');

  const { sentViaEmail } = req.query as { sentViaEmail: string };

  const invitations = await getInvitations(teamMember.teamId, !!sentViaEmail);

  recordMetric('invitation.fetched');

  res.status(200).json({ data: invitations });
};

// Delete an invitation
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_invitation', 'delete');

  const { id } = req.query as { id: string };

  const invitation = await getInvitation({ id });

  if (
    invitation.invitedBy != teamMember.user.id ||
    invitation.teamId != teamMember.teamId
  ) {
    throw new ApiError(
      400,
      `You don't have permission to delete this invitation.`
    );
  }

  await deleteInvitation({ id });

  sendAudit({
    action: 'member.invitation.delete',
    crud: 'd',
    user: teamMember.user,
    team: teamMember.team,
  });

  await sendEvent(teamMember.teamId, 'invitation.removed', invitation);

  recordMetric('invitation.removed');

  res.status(200).json({ data: {} });
};

// Accept an invitation to an organization
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { inviteToken } = req.body as { inviteToken: string };

  const invitation = await getInvitation({ token: inviteToken });

  if (await isInvitationExpired(invitation)) {
    throw new ApiError(400, 'Invitation expired. Please request a new one.');
  }

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  if (session?.user.email != invitation.email) {
    throw new ApiError(
      400,
      'You must be logged in with the email address you were invited with.'
    );
  }

  const teamMember = await addTeamMember(
    invitation.team.id,
    userId,
    invitation.role
  );

  await sendEvent(invitation.team.id, 'member.created', teamMember);
  await deleteInvitation({ token: inviteToken });

  recordMetric('member.created');

  res.status(200).json({ data: {} });
};
