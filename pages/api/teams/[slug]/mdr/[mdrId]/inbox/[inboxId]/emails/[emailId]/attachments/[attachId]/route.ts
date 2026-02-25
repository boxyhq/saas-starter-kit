import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership, assertTeamNotSuspended } from '@/lib/mdr';
import { mdrAuditEvent } from '@/lib/mdrAudit';
import env from '@/lib/env';
import * as z from 'zod';

const routeSchema = z.object({
  sectionId: z.string().uuid(),
  title: z.string().min(1),
  docNumber: z.string().optional().default(''),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await handlePOST(req, res);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr_inbox', 'update');
  await assertTeamNotSuspended(user.team.id);

  const { mdrId, inboxId, emailId, attachId } = req.query as {
    mdrId: string; inboxId: string; emailId: string; attachId: string;
  };
  await assertMdrOwnership(mdrId, user.team.id);

  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');
  const { sectionId, title, docNumber } = parsed.data;

  // Fetch the attachment
  const attachment = await prisma.mdrInboxAttachment.findFirst({
    where: { id: attachId, inboxEmail: { inboxId, id: emailId } },
  });
  if (!attachment) throw new ApiError(404, 'Attachment not found');
  if (attachment.mdrDocumentId) throw new ApiError(409, 'Attachment already routed');

  // Verify section belongs to this project
  const section = await prisma.mdrSection.findFirst({
    where: { id: sectionId, mdrProjectId: mdrId },
  });
  if (!section) throw new ApiError(404, 'Section not found');

  // Create document and link to section
  const [document] = await prisma.$transaction([
    prisma.mdrDocument.create({
      data: {
        mdrProjectId: mdrId,
        teamId: user.team.id,
        title,
        docNumber: docNumber || `INBOX-${Date.now()}`,
        s3Key: attachment.s3Key,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        originalName: attachment.filename,
        sectionLinks: {
          create: { sectionId },
        },
      },
    }),
    prisma.mdrInboxAttachment.update({
      where: { id: attachId },
      data: { mdrDocumentId: undefined, routedAt: new Date() },
    }),
  ]);

  // Update attachment with the created document id
  await prisma.mdrInboxAttachment.update({
    where: { id: attachId },
    data: { mdrDocumentId: document.id },
  });

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
