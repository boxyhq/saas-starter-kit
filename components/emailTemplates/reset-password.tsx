import app from '@/lib/app';
import env from '@/lib/env';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  url: string;
}

const ResetPasswordEmail = ({ url }: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset Your BoxyHQ Password</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid bg-white border-[#f0f0f0] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={app.logoUrl}
              width="40"
              height="33"
              alt="BoxyHQ"
              className="my-8 mx-auto"
            />

            <Section>
              <Text>Dear User,</Text>
              <Text>
                We have received a request to reset your BoxyHQ password. If you
                did not request a password reset, please ignore this email.
              </Text>
              <Text>
                To reset your password, please click on the link below:
              </Text>

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
                This link will expire in 60 minutes. After that, you will need
                to request another password reset.
              </Text>

              <Hr className="border border-solid border-[#eaeaea] my-[20px] mx-0 w-full" />

              <Text className="my-0 text-center text-xs text-[#666666]">
                <span className="block">The BoxyHQ Team</span>
                <span className="block">Imaginary Location, London, UK</span>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;
