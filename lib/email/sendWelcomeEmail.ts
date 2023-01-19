import env from '../env';
import { sendEmail } from './sendEmail';

export const sendWelcomeEmail = async (
  name: string,
  email: string,
  team: string
) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to BoxyHQ',
    html: `Hello <b>${name}</b>,
        <br/><br/>You have been successfully signed up to BoxyHQ on team <b>${team}</b>. Click the below link to login now.
        <br/><br/><a href="${env.appUrl}/auth/login">Login</a>`,
  });
};
