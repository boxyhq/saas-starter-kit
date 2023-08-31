import { sendEmail } from './sendEmail';
import { render } from '@react-email/render';
import { ResetPasswordEmail } from '@/components/emailTemplates';

export const sendPasswordResetEmail = async (email: string, url: string) => {
  const html = render(ResetPasswordEmail({ url }));
  await sendEmail({
    to: email,
    subject: 'Reset Your BoxyHQ Password',
    html,
  });
};
