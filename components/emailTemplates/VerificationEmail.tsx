import {
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import EmailLayout from './EmailLayout';
import app from '@/lib/app';
import { useTranslation } from 'next-i18next';


interface VerificationEmailProps {
  subject: string;
  verificationLink: string;
}

const VerificationEmail = ({
  subject,
  verificationLink,
}: VerificationEmailProps) => {
  const { t } = useTranslation('common');

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Heading as="h2">{t('Confirm-your-account')}</Heading>

        <Text>{t('pre-Confirm-account')}</Text>
        <Text>
        {t('Confirm-account-description',{app})}
        </Text>

        <Container className="text-center">
          <Button
            href={verificationLink}
            pX={20}
            pY={16}
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          >
            {t('Confirm-account')}
          </Button>
        </Container>

        <Text>
        {t('no-create-account')}
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default VerificationEmail;
