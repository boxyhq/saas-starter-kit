import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import { validateWithSchema, updateMdrDocumentSchema } from '@/lib/zod';
import { deleteS3Object } from '@/lib/s3';
import { mdrAuditEvent } from '@/lib/mdrAudit';
import { sendMdrEvent } from '@/lib/mdrEvents';
import { logMdrActivity } from '@/lib/mdrActivityLog';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, PATCH, DELETE');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'read');

  const { mdrId, docId } = req.query as { mdrId: string; docId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id);

  const doc = await prisma.mdrDocument.findUniqueOrThrow({
    where: { id: docId, mdrProjectId: mdrId },
    include: {
      versions: { orderBy: { uploadedAt: 'desc' } },
      sectionLinks: { include: { section: { select: { id: true, title: true } } } },
    },
  });

  res.status(200).json({ data: doc });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'update');

  const { mdrId, docId } = req.query as { mdrId: string; docId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');

  const data = validateWithSchema(updateMdrDocumentSchema, req.body);

  const doc = await prisma.mdrDocument.update({
    where: { id: docId, mdrProjectId: mdrId },
    data: {
      ...data,
      docDate: data.docDate ? new Date(data.docDate) : undefined,
    },
  });

  await mdrAuditEvent(
    user.team.id,
    user.team.name,
    user.id,
    user.name as string,
    'mdr_document.updated',
    { id: docId, name: doc.title, type: 'mdr_document' }
  );

  await sendMdrEvent(user.team.id, 'mdr.document.updated', {
    documentId: docId,
    docNumber: doc.docNumber,
    mdrProjectId: mdrId,
  });

  logMdrActivity({ mdrId, userId: user.id, action: 'document_updated', details: { docNumber: doc.docNumber, title: doc.title } });
  res.status(200).json({ data: doc });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'delete');

  const { mdrId, docId } = req.query as { mdrId: string; docId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');

  const doc = await prisma.mdrDocument.findUniqueOrThrow({
    where: { id: docId, mdrProjectId: mdrId },
    select: { s3Key: true, pdfS3Key: true, title: true },
  });

  // Delete the document and all its section links
  await prisma.mdrDocument.delete({ where: { id: docId } });

  // Clean up S3 objects
  await Promise.allSettled([
    deleteS3Object(doc.s3Key),
    doc.pdfS3Key ? deleteS3Object(doc.pdfS3Key) : Promise.resolve(),
  ]);

  await mdrAuditEvent(
    user.team.id,
    user.team.name,
    user.id,
    user.name as string,
    'mdr_document.deleted',
    { id: docId, name: doc.title, type: 'mdr_document' }
  );

  await sendMdrEvent(user.team.id, 'mdr.document.deleted', {
    documentId: docId,
    mdrProjectId: mdrId,
  });

  logMdrActivity({ mdrId, userId: user.id, action: 'document_deleted', details: { title: doc.title } });
  res.status(204).end();
};
