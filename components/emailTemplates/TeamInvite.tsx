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
import { useTranslation } from 'next-i18next';


interface TeamInviteEmailProps {
  team: Team;
  invitationLink: string;
  userFirstname?: string;
}

const TeamInviteEmail = ({ team, invitationLink }: TeamInviteEmailProps) => {
  const { t } = useTranslation('common');

  return (
    <Html>
      <Head />
      <Preview>{t('Team-Invitation')}</Preview>
      <EmailLayout>
        <Text>{t('Team-Invitation',{team})}</Text>
        <Text>
        {t('Team-Invitation-description')}
        </Text>

        <Container className="text-center">
          <Button
            href={invitationLink}
            pX={20}
            pY={16}
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          >
            {t('Join-team')}
          </Button>
        </Container>
      </EmailLayout>
    </Html>
  );
};

export default TeamInviteEmail;
