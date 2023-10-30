import app from '@/lib/app';
import {
  Button,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import EmailLayout from './EmailLayout';

interface ResetPasswordEmailProps {
  url: string;
  subject: string;
  email: string;
}

const ResetPasswordEmail = ({
  url,
  subject,
  email,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Text>
          We received a request to reset the password for the {app.name} account
          associated with {email}.
        </Text>
        <Container className="text-center">
          <Button
            href={url}
            className="bg-brand text-white font-medium py-2 px-4 rounded"
          >
            Reset your password
          </Button>
        </Container>
        <Text>
          Please ignore this email if you did not request a password reset. No
          changes have been made to your account.
        </Text>
        <Text>
          This link will expire in 60 minutes. After that, you will need to
          request another password reset.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default ResetPasswordEmail;
