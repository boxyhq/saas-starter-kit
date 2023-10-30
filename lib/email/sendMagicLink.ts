import { sendEmail } from './sendEmail';
import { render } from '@react-email/render';
import app from '../app';
import MagicLink from '@/components/emailTemplates/MagicLink';

export const sendMagicLink = async (email: string, url: string) => {
  const subject = `Sign in to ${app.name}`;

  const html = render(MagicLink({ url, subject }));

  await sendEmail({
    to: email,
    subject,
    html,
  });
};
