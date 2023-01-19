import { Invitation, Team } from '@prisma/client';

import env from '../env';
import { sendEmail } from './sendEmail';

export const sendTeamInviteEmail = async (
  team: Team,
  invitation: Invitation
) => {
  const invitationLink = `${env.appUrl}/invitations/${invitation.token}`;

  await sendEmail({
    to: invitation.email,
    subject: 'Team Invitation',
    html: `You have been invited to join the team, ${team.name}.
    <br/><br/> Click the below link to accept the invitation and join the team. 
    <br/><br/> <a href="${invitationLink}">${invitationLink}</a>`,
  });
};
