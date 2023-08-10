import nodemailer from 'nodemailer';

import env from '../env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData) => {
  if (!env.smtp.host) {
    return;
  }

  const emailDefaults = {
    from: env.smtp.from,
  };

  await transporter.sendMail({ ...emailDefaults, ...data });
};
