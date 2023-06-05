import env from '../env';
import { sendEmail } from './sendEmail';

export const sendPasswordResetEmail = async (email: string, url: string) => {
  await sendEmail({
    to: email,
    subject: 'Reset Your BoxyHQ Password',
    html: `
        Dear User,
        <br/><br/>
        We have received a request to reset your BoxyHQ password. If you did not request a password reset, please ignore this email.
        <br/><br/>
        To reset your password, please click on the link below:
        <br/><br/>
        <a href="${env.appUrl}/auth/reset-password/${url}">Reset Password Link</a>
        <br/><br/>
        This link will expire in 60 minutes. After that, you will need to request another password reset.
        <br/><br/>
        Thank you for using BoxyHQ.
        <br/><br/>
        Best regards,
        <br/><br/>
        The BoxyHQ Team
     `,
  });
};
