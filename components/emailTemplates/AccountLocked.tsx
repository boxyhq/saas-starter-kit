import {
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

import app from '@/lib/app';
import EmailLayout from './EmailLayout';

interface AccountLockedProps {
  subject: string;
  url: string;
}

const AccountLocked = ({ subject, url }: AccountLockedProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Heading as="h2">Account Locked</Heading>
        <Text>
          Your {app.name} account has been locked due to too many failed login
          attempts.
        </Text>
        <Text>Please click the button below to unlock your account.</Text>
        <Container className="text-center">
          <Button
            href={url}
            className="bg-brand text-white font-medium py-2 px-4 rounded"
          >
            Unlock account
          </Button>
        </Container>
        <Text>
          Please contact us if you need any assistance with unlocking your
          account.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default AccountLocked;
