import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership, assertTeamNotSuspended } from '@/lib/mdr';
import { mdrAuditEvent } from '@/lib/mdrAudit';
import env from '@/lib/env';

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
  throwIfNotAllowed(user, 'mdr', 'update');
  await assertTeamNotSuspended(user.team.id);
  const { mdrId, docId, versionId } = req.query as { mdrId: string; docId: string; versionId: string };
  await assertMdrOwnership(mdrId, user.team.id);

  const version = await prisma.mdrDocumentVersion.findFirst({
    where: { id: versionId, documentId: docId },
  });
  if (!version) throw new ApiError(404, 'Version not found');

  const document = await prisma.mdrDocument.findFirst({
    where: { id: docId, mdrProjectId: mdrId },
  });
  if (!document) throw new ApiError(404, 'Document not found');

  // Save current state as a new version before restoring
  await prisma.mdrDocumentVersion.create({
    data: {
      documentId: docId,
      revision: document.revision ?? '0',
      s3Key: document.s3Key,
      pdfS3Key: document.pdfS3Key,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      originalName: document.originalName,
      status: document.status,
      uploadedBy: user.id,
      changeNote: 'Auto-saved before restore',
    },
  });

  // Restore the selected version
  const updated = await prisma.mdrDocument.update({
    where: { id: docId },
    data: {
      s3Key: version.s3Key,
      pdfS3Key: version.pdfS3Key,
      fileSize: version.fileSize,
      mimeType: version.mimeType,
      originalName: version.originalName,
      revision: version.revision,
      status: version.status,
    },
  });

  await mdrAuditEvent(
    user.team.id,
    user.team.name,
    user.id,
    user.name ?? '',
    'mdr_document.updated',
    { id: docId, name: document.title, type: 'mdr_document' },
    { action: 'restore_version', versionId }
  );

  res.status(200).json({ data: updated });
};
