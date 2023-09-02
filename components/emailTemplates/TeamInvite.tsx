import {
  Button,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import EmailLayout from './EmailLayout';
import { Team } from '@prisma/client';

interface TeamInviteEmailProps {
  team: Team;
  invitationLink: string;
  userFirstname?: string;
}

const TeamInviteEmail = ({
  team,
  invitationLink,
  userFirstname = 'User',
}: TeamInviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Team Invitation</Preview>
      <EmailLayout>
        <Text>Dear {userFirstname},</Text>
        <Text>You have been invited to join the team at {team.name}.</Text>
        <Text>
          Click the link below to accept the invitation and join the team:
        </Text>

        <Container className="text-center">
          <Button
            href={invitationLink}
            pX={20}
            pY={16}
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          >
            Join team
          </Button>
        </Container>
      </EmailLayout>
    </Html>
  );
};

export default TeamInviteEmail;
