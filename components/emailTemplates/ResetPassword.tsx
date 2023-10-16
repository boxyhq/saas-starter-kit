import app from '@/lib/app';
import env from '@/lib/env';
import {
  Button,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import { useTranslation } from 'next-i18next';

import EmailLayout from './EmailLayout';

interface ResetPasswordEmailProps {
  url: string;
}

const ResetPasswordEmail = ({ url }: ResetPasswordEmailProps) => {
  const { t } = useTranslation('common');

  return (
    <Html>
      <Head />
      <Preview>{t('reset-password-text', {app})}</Preview>
      <EmailLayout>
        <Text>
        {t('reset-password-description', {app})}
        </Text>
        <Text>To reset your password, please click on the link below:</Text>

        <Container className="text-center">
          <Button
            href={`${env.appUrl}/auth/reset-password/${url}`}
            pX={20}
            pY={16}
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          >
            {t('reset-password')}
          </Button>
        </Container>

        <Text>
          This link will expire in 60 minutes. After that, you will need to
          request another password reset.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default ResetPasswordEmail;
