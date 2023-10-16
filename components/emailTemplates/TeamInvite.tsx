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
      <Preview>{t('team-invitation')}</Preview>
      <EmailLayout>
        <Text>{t('team-invitation',{team})}</Text>
        <Text>
        {t('team-invitation-description')}
        </Text>

        <Container className="text-center">
          <Button
            href={invitationLink}
            pX={20}
            pY={16}
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          >
            {t('join-team')}
          </Button>
        </Container>
      </EmailLayout>
    </Html>
  );
};

export default TeamInviteEmail;
