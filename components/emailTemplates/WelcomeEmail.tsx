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
        <Text>Dear {name},</Text>
        <Text>
          You have been successfully signed up to {app.name} on team{' '}
          <b>{team}</b>.
        </Text>
        <Text>Click the below link to login now:</Text>
        <Container className="text-center">
          <Button
            href={`${env.appUrl}/auth/login`}
            pX={20}
            pY={16}
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          >
            Login to your account
          </Button>
        </Container>
      </EmailLayout>
    </Html>
  );
};

export default WelcomeEmail;
