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

interface WelcomeEmailProps {
  name: string;
  team: string;
  subject: string;
}

const WelcomeEmail = ({ name, subject, team }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Text>Hi {name},</Text>
        <Text>
          You have been successfully signed up to {app.name} on team{' '}
          <b>{team}</b>.
        </Text>
        <Text>Click the link below to login now:</Text>
        <Container className="text-center">
          <Button
            href={`${env.appUrl}/auth/login`}
            className="bg-brand text-white font-medium py-2 px-4 rounded"
          >
            Login to your account
          </Button>
        </Container>
      </EmailLayout>
    </Html>
  );
};

export default WelcomeEmail;
