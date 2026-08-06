import nodemailer from 'nodemailer';
import { mailkiteTransport } from 'nodemailer-mailkite-transport';

import env from '../env';

// MailKite is used when MAIL_PROVIDER=mailkite and an API key is set. Anything
// else falls back to SMTP, preserving the previous behavior.
const useMailkite = env.mailProvider === 'mailkite';
const mailkiteApiKey = env.mailkite.apiKey;

const transporter =
  useMailkite && mailkiteApiKey
    ? nodemailer.createTransport(
        mailkiteTransport({
          apiKey: mailkiteApiKey,
          ...(env.mailkite.baseUrl ? { baseUrl: env.mailkite.baseUrl } : {}),
        })
      )
    : nodemailer.createTransport({
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
  // Skip sending in local dev when the configured provider isn't set up, instead
  // of throwing. SMTP stays the default and no-ops when SMTP_HOST is missing.
  if (useMailkite) {
    if (!mailkiteApiKey) {
      return;
    }
  } else if (!env.smtp.host) {
    return;
  }

  const emailDefaults = {
    from: env.smtp.from,
  };

  await transporter.sendMail({ ...emailDefaults, ...data });
};
