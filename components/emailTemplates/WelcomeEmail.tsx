import {
  Button,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import EmailLayout from './EmailLayout';
import app from '@/lib/app';
import env from '@/lib/env';
import { useTranslation } from 'next-i18next';


interface WelcomeEmailProps {
  name: string;
  team: string;
  subject: string;
}

const WelcomeEmail = ({ name, subject, team }: WelcomeEmailProps) => {
  const { t } = useTranslation('common');

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Text>{t('Hi-name',{name})}</Text>
        <Text>
        {t('successfull-signed-up',{app})}
          <b>{team}</b>.
        </Text>
        <Text>{t('link-login')}</Text>
        <Container className="text-center">
          <Button
            href={`${env.appUrl}/auth/login`}
            pX={20}
            pY={16}
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          >
            {t('Login')}
          </Button>
        </Container>
      </EmailLayout>
    </Html>
  );
};

export default WelcomeEmail;
