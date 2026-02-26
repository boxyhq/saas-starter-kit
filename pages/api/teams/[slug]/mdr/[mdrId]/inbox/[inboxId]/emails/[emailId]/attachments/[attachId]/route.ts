import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import {
  assertMdrNotFinal,
  assertMdrOwnership,
  assertTeamNotSuspended,
} from '@/lib/mdr';
import { mdrAuditEvent } from '@/lib/mdrAudit';
import { conversionQueue } from '@/lib/mdrQueue';
import env from '@/lib/env';
import * as z from 'zod';

const CONVERTIBLE_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword',                                                        // .doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',        // .xlsx
  'application/vnd.ms-excel',                                                  // .xls
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',// .pptx
]);

const routeSchema = z.object({
  sectionId: z.string().uuid(),
  title: z.string().min(1).max(500),
  docNumber: z.string().max(100).optional().default(''),
  discipline: z.string().max(100).optional(),
  revision: z.string().max(20).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res
        .status(405)
        .json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await handlePOST(req, res);
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr_inbox', 'update');
  await assertTeamNotSuspended(user.team.id);

  const { mdrId, inboxId, emailId, attachId } = req.query as {
    mdrId: string;
    inboxId: string;
    emailId: string;
    attachId: string;
  };

  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrNotFinal(mdrId);

  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');
  }
  const { sectionId, title, docNumber, discipline, revision } = parsed.data;

  // Fetch the attachment and verify it belongs to this inbox/email
  const attachment = await prisma.mdrInboxAttachment.findFirst({
    where: { id: attachId, inboxEmail: { inboxId, id: emailId } },
  });
  if (!attachment) throw new ApiError(404, 'Attachment not found');
  if (attachment.mdrDocumentId) throw new ApiError(409, 'Attachment already routed');

  // Verify section belongs to this project
  const section = await prisma.mdrSection.findFirst({
    where: { id: sectionId, mdrProjectId: mdrId },
    select: { id: true },
  });
  if (!section) throw new ApiError(404, 'Section not found in this project');

  // Atomically: create document + link to section + stamp attachment
  const document = await prisma.$transaction(async (tx) => {
    const doc = await tx.mdrDocument.create({
      data: {
        mdrProjectId: mdrId,
        teamId: user.team.id,
        title,
        docNumber: docNumber || `INBOX-${Date.now()}`,
        discipline: discipline ?? null,
        revision: revision ?? '0',
        s3Key: attachment.s3Key,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        originalName: attachment.filename,
        sectionLinks: {
          create: { sectionId },
        },
      },
    });

    await tx.mdrInboxAttachment.update({
      where: { id: attachId },
      data: { mdrDocumentId: doc.id, routedAt: new Date() },
    });

    return doc;
  });

  // Enqueue PDF conversion for Office formats (non-fatal if Redis unavailable)
  if (CONVERTIBLE_MIME_TYPES.has(attachment.mimeType)) {
    try {
      await conversionQueue.add('convert_inbox_attachment', {
        documentId: document.id,
        teamId: user.team.id,
        mdrProjectId: mdrId,
      });
    } catch (qErr) {
      console.warn('Could not enqueue conversion job (non-fatal):', qErr);
    }
  }

  await mdrAuditEvent(
    user.team.id,
    user.team.name,
    user.id,
    user.name ?? '',
    'mdr_document.uploaded',
    { id: document.id, name: document.title, type: 'mdr_document' }
  );

  res.status(201).json({ data: document });
};
