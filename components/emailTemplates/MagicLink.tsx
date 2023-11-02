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

interface MagicLinkProps {
  subject: string;
  url: string;
}

const MagicLink = ({ subject, url }: MagicLinkProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Heading as="h2">Log in to {app.name}</Heading>
        <Text>
          Click the button below to log in to your {app.name} account. This
          button will expire in 60 minutes.
        </Text>
        <Container className="text-center">
          <Button
            href={url}
            className="bg-brand text-white font-medium py-2 px-4 rounded"
          >
            Log in to {app.name}
          </Button>
        </Container>
        <Text>
          If you did not request this email, you can safely ignore it.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default MagicLink;
