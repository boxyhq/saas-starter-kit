import { sendTeamInviteEmail } from '@/lib/email/sendTeamInviteEmail';
import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import { sendEvent } from '@/lib/svix';
import {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitationCount,
  getInvitations,
  isInvitationExpired,
} from 'models/invitation';
import { addTeamMember, throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { extractEmailDomain, isEmailAllowed } from '@/lib/email/utils';
import { Invitation, Role } from '@prisma/client';
import { countTeamMembers } from 'models/teamMember';
import {
  acceptInvitationSchema,
  deleteInvitationSchema,
  getInvitationsSchema,
  inviteViaEmailSchema,
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

  const { email, role, sentViaEmail, domains } = validateWithSchema(
    inviteViaEmailSchema,
    req.body
  ) as {
    email?: string;
    role: Role;
    sentViaEmail: boolean;
    domains?: string;
  };

  let invitation: undefined | Invitation = undefined;

  // Invite via email
  if (sentViaEmail) {
    if (!email) {
      throw new ApiError(400, 'Email is required.');
    }

    if (!isEmailAllowed(email)) {
      throw new ApiError(
        400,
        'It seems you entered a non-business email. Invitations can only be sent to work emails.'
      );
    }



    // Check if user already a member
    const memberExists = await countTeamMembers({
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

    // Check for existing invitation
    const invitationExists = await getInvitationCount({
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
      allowedDomains: [],
    });
  }

  // Invite via link
  if (!sentViaEmail) {
    invitation = await createInvitation({
      teamId: teamMember.teamId,
      invitedBy: teamMember.userId,
      role,
      email: null,
      sentViaEmail: false,
      allowedDomains: domains
        ? domains.split(',').map((d) => d.trim().toLowerCase())
        : [],
    });
  }

  if (!invitation) {
    throw new ApiError(400, 'Could not create invitation. Please try again.');
  }

  if (invitation.sentViaEmail) {
    await sendTeamInviteEmail(teamMember.team, invitation);
  }

  await sendEvent(teamMember.teamId, 'invitation.created', invitation);

  sendAudit({
    action: 'member.invitation.create',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('invitation.created');

  res.status(204).end();
};

// Get all invitations for a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_invitation', 'read');

  const { sentViaEmail } = validateWithSchema(
    getInvitationsSchema,
    req.query as { sentViaEmail: string }
  );

  const invitations = await getInvitations(
    teamMember.teamId,
    sentViaEmail === 'true'
  );

  recordMetric('invitation.fetched');

  res.status(200).json({ data: invitations });
};

// Delete an invitation
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_invitation', 'delete');

  const { id } = validateWithSchema(
    deleteInvitationSchema,
    req.query as { id: string }
  );

  const invitation = await getInvitation({ id });

  if (
    invitation.invitedBy != teamMember.user.id ||
    invitation.team.id != teamMember.teamId
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
  const { inviteToken } = validateWithSchema(
    acceptInvitationSchema,
    req.body as { inviteToken: string }
  );

  const invitation = await getInvitation({ token: inviteToken });

  if (await isInvitationExpired(invitation.expires)) {
    throw new ApiError(400, 'Invitation expired. Please request a new one.');
  }

  const session = await getSession(req, res);
  const email = session?.user.email as string;

  // Make sure the user is logged in with the invited email address (Join via email)
  if (invitation.sentViaEmail && invitation.email !== email) {
    throw new ApiError(
      400,
      'You must be logged in with the email address you were invited with.'
    );
  }

  // Make sure the user is logged in with an allowed domain (Join via link)
  if (!invitation.sentViaEmail && invitation.allowedDomains.length) {
    const emailDomain = extractEmailDomain(email);
    const allowJoin = invitation.allowedDomains.find(
      (domain) => domain === emailDomain
    );

    if (!allowJoin) {
      throw new ApiError(
        400,
        'You must be logged in with an email address from an allowed domain.'
      );
    }
  }

  const teamMember = await addTeamMember(
    invitation.team.id,
    session?.user?.id as string,
    invitation.role
  );

  await sendEvent(invitation.team.id, 'member.created', teamMember);

  if (invitation.sentViaEmail) {
    await deleteInvitation({ token: inviteToken });
  }

  recordMetric('member.created');

  res.status(204).end();
};
