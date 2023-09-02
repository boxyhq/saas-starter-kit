import { render } from '@react-email/components';
import { sendEmail } from './sendEmail';
import { WelcomeEmail } from '@/components/emailTemplates';

export const sendWelcomeEmail = async (
  name: string,
  email: string,
  team: string
) => {
  const subject = 'Welcome to BoxyHQ';
  const html = render(WelcomeEmail({ name, team, subject }));

  await sendEmail({
    to: email,
    subject,
    html,
  });
};
