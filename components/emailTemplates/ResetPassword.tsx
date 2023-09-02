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
import EmailLayout from './EmailLayout';

interface ResetPasswordEmailProps {
  url: string;
}

const ResetPasswordEmail = ({ url }: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset Your {app.name} Password</Preview>
      <EmailLayout>
        <Text>Dear User,</Text>
        <Text>
          We have received a request to reset your {app.name} password. If you
          did not request a password reset, please ignore this email.
        </Text>
        <Text>To reset your password, please click on the link below:</Text>

        <Container className="text-center">
          <Button
            href={`${env.appUrl}/auth/reset-password/${url}`}
            pX={20}
            pY={16}
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          >
            Reset password
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
