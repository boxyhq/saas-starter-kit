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

interface VerificationEmailProps {
  subject: string;
  verificationLink: string;
}

const VerificationEmail = ({
  subject,
  verificationLink,
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Heading as="h2">Confirm your account!</Heading>

        <Text>Before we can get started, we need to confirm your account.</Text>
        <Text>
          Thank you for signing up for {app.name}. To confirm your account,
          please click the link below:
        </Text>

        <Container className="text-center">
          <Button
            href={verificationLink}
            pX={20}
            pY={16}
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          >
            Confirm account
          </Button>
        </Container>

        <Text>
          If you did not create an account, no further action is required.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default VerificationEmail;
