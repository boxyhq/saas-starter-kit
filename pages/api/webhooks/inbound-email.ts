/**
 * SendGrid Inbound Parse Webhook
 *
 * Receives inbound emails sent to MDR team inboxes.
 * Configure SendGrid Inbound Parse to POST to: /api/webhooks/inbound-email
 *
 * DNS: MX record pointing inbound.yourdomain.com → mx.sendgrid.net
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { prisma } from '@/lib/prisma';
import { s3Client } from '@/lib/s3';
import { mdrInboxAttachmentKey } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import env from '@/lib/env';
import { promises as fs } from 'fs';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Always respond 200 — SendGrid retries on non-2xx
  if (req.method !== 'POST') {
    return res.status(200).end();
  }

  try {
    const form = new IncomingForm({ keepExtensions: true });

    const [fields, files] = await new Promise<
      [Record<string, string | string[]>, Record<string, any>]
    >((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields as any, files]);
      });
    });

    const toHeader = Array.isArray(fields.to) ? fields.to[0] : fields.to;
    const fromEmail = (
      Array.isArray(fields.from) ? fields.from[0] : fields.from
    ) as string;
    const fromName = (
      Array.isArray(fields.fromname) ? fields.fromname[0] : fields.fromname
    ) as string | undefined;
    const subject = (
      Array.isArray(fields.subject) ? fields.subject[0] : fields.subject
    ) as string | undefined;
    const bodyText = (
      Array.isArray(fields.text) ? fields.text[0] : fields.text
    ) as string | undefined;

    // Extract the email address from the To header
    const toEmailMatch = toHeader?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const toEmail = toEmailMatch?.[0];

    if (!toEmail) {
      return res.status(200).end();
    }

    // Find the matching inbox
    const inbox = await prisma.mdrEmailInbox.findUnique({
      where: { emailAddress: toEmail },
      select: { id: true, teamId: true },
    });

    if (!inbox) {
      return res.status(200).end();
    }

    // Create inbox email record
    const inboxEmail = await prisma.mdrInboxEmail.create({
      data: {
        inboxId: inbox.id,
        fromEmail: fromEmail || '',
        fromName: fromName ?? null,
        subject: subject ?? null,
        bodyText: bodyText ?? null,
      },
    });

    // Process attachments
    const attachmentCount = parseInt(
      (Array.isArray(fields['attachment-info'])
        ? fields['attachment-info'][0]
        : fields['attachment-info'] ?? '0') as string
    ) || Object.keys(files).filter((k) => k.startsWith('attachment')).length;

    for (let i = 1; i <= attachmentCount; i++) {
      const file = files[`attachment${i}`];
      if (!file) continue;

      const attachFile = Array.isArray(file) ? file[0] : file;
      const filename =
        attachFile.originalFilename || attachFile.newFilename || `attachment-${i}`;
      const s3Key = mdrInboxAttachmentKey(
        inbox.teamId,
        inbox.id,
        inboxEmail.id,
        filename
      );

      const buffer = await fs.readFile(attachFile.filepath);
      const fileSize = buffer.length;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: env.s3.bucket,
          Key: s3Key,
          Body: buffer,
          ContentType: attachFile.mimetype || 'application/octet-stream',
        })
      );

      await prisma.mdrInboxAttachment.create({
        data: {
          inboxEmailId: inboxEmail.id,
          filename,
          s3Key,
          fileSize: BigInt(fileSize),
          mimeType: attachFile.mimetype || 'application/octet-stream',
        },
      });
    }

    res.status(200).end();
  } catch (error) {
    console.error('Inbound email webhook error:', error);
    // Still return 200 to prevent SendGrid from retrying
    res.status(200).end();
  }
}
