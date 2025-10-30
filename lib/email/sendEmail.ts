import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';
import { Resend } from 'resend';

import env from '../env';

// Initialize providers
const smtpTransporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

if (env.sendgrid.apiKey) {
  sgMail.setApiKey(env.sendgrid.apiKey);
}

const resend = env.resend.apiKey ? new Resend(env.resend.apiKey) : null;

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData) => {
  const provider = env.emailProvider;

  switch (provider) {
    case 'smtp':
      if (!env.smtp.host) {
        throw new Error('SMTP host not configured');
      }
      {
        const emailDefaults = {
          from: env.smtp.from,
        };
        await smtpTransporter.sendMail({ ...emailDefaults, ...data });
      }
      break;

    case 'sendgrid':
      if (!env.sendgrid.apiKey) {
        throw new Error('SendGrid API key not configured');
      }
      await sgMail.send({
        to: data.to,
        from: env.smtp.from || 'noreply@example.com', // Use SMTP_FROM or default
        subject: data.subject,
        html: data.html,
        text: data.text,
      });
      break;

    case 'resend':
      if (!env.resend.apiKey || !resend) {
        throw new Error('Resend API key not configured');
      }
      await resend.emails.send({
        from: env.smtp.from || 'noreply@example.com', // Use SMTP_FROM or default
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      });
      break;

    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
};
