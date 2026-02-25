import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import { validateWithSchema, createMdrDocumentSchema } from '@/lib/zod';
import { mdrAuditEvent } from '@/lib/mdrAudit';
import { sendMdrEvent } from '@/lib/mdrEvents';
import { conversionQueue } from '@/lib/mdrQueue';
import { isConvertibleMimeType } from '@/lib/gotenberg';
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
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
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

  const { mdrId, sectionId } = req.query as {
    mdrId: string;
    sectionId: string;
  };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id);

  const docs = await prisma.mdrSectionDocument.findMany({
    where: { sectionId },
    orderBy: { order: 'asc' },
    include: { document: true },
  });

  res.status(200).json({ data: docs.map((d) => d.document) });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'create');

  const { mdrId, sectionId } = req.query as {
    mdrId: string;
    sectionId: string;
  };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');

  // Handle linking an existing document
  if (req.body.existingDocumentId) {
    const { existingDocumentId } = req.body as { existingDocumentId: string };

    const maxOrder = await prisma.mdrSectionDocument.aggregate({
      where: { sectionId },
      _max: { order: true },
    });

    const link = await prisma.mdrSectionDocument.create({
      data: {
        sectionId,
        documentId: existingDocumentId,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: { document: true },
    });

    return res.status(201).json({ data: link.document });
  }

  // Create a new document
  const data = validateWithSchema(createMdrDocumentSchema, req.body);

  const maxOrder = await prisma.mdrSectionDocument.aggregate({
    where: { sectionId },
    _max: { order: true },
  });

  const doc = await prisma.$transaction(async (tx) => {
    const newDoc = await tx.mdrDocument.create({
      data: {
        mdrProjectId: mdrId,
        teamId: user.team.id,
        title: data.title,
        docNumber: data.docNumber,
        discipline: data.discipline,
        revision: data.revision ?? '0',
        status: data.status ?? 'DRAFT',
        s3Key: data.s3Key,
        sha256Hash: data.sha256Hash,
        fileSize: BigInt(data.fileSize),
        mimeType: data.mimeType,
        originalName: data.originalName,
        docDate: data.docDate ? new Date(data.docDate) : null,
        uploadedBy: user.id,
      },
    });

    await tx.mdrSectionDocument.create({
      data: {
        sectionId,
        documentId: newDoc.id,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return newDoc;
  });

  // Enqueue conversion if needed
  if (isConvertibleMimeType(doc.mimeType)) {
    await conversionQueue.add('convert', {
      documentId: doc.id,
      teamId: user.team.id,
      mdrProjectId: mdrId,
    });
  }

  await mdrAuditEvent(
    user.team.id,
    user.team.name,
    user.id,
    user.name as string,
    'mdr_document.uploaded',
    { id: doc.id, name: doc.title, type: 'mdr_document' },
    {
      docNumber: doc.docNumber,
      revision: doc.revision ?? '',
      fileSize: doc.fileSize.toString(),
    }
  );

  await sendMdrEvent(user.team.id, 'mdr.document.uploaded', {
    documentId: doc.id,
    docNumber: doc.docNumber,
    title: doc.title,
    mdrProjectId: mdrId,
  });

  res.status(201).json({ data: doc });
};
