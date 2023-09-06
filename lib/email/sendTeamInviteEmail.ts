import { Invitation, Team } from '@prisma/client';
import { sendEmail } from './sendEmail';
import { TeamInviteEmail } from '@/components/emailTemplates';
import { render } from '@react-email/components';
import env from '../env';

export const sendTeamInviteEmail = async (
  team: Team,
  invitation: Invitation
) => {
  const invitationLink = `${env.appUrl}/invitations/${invitation.token}`;
  const html = render(TeamInviteEmail({ invitationLink, team }));

  await sendEmail({
    to: invitation.email,
    subject: 'Team Invitation',
    html,
  });
};
