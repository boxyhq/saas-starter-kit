import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership, assertTeamNotSuspended } from '@/lib/mdr';
import { mdrAuditEvent } from '@/lib/mdrAudit';
import { logMdrActivity } from '@/lib/mdrActivityLog';
import env from '@/lib/env';
import { s3Client, mdrTransmittalCoverSheetKey } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { generateTransmittalCoverSheet } from '@/lib/mdrTransmittalCoverSheet';

/**
 * POST /api/teams/[slug]/mdr/[mdrId]/transmittals/[transmittalId]/issue
 *
 * Issues a transmittal: sets status to ISSUED, records issuedAt, and optionally
 * generates a PDF cover sheet (if Gotenberg is available).
 */
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

  const { mdrId, transmittalId } = req.query as { mdrId: string; transmittalId: string };
  await assertMdrOwnership(mdrId, user.team.id);

  const transmittal = await prisma.mdrTransmittal.findFirst({
    where: { id: transmittalId, mdrProjectId: mdrId },
    include: {
      documents: { include: { document: true } },
      mdrProject: {
        select: {
          name: true,
          projectNumber: true,
          clientName: true,
          team: { include: { branding: true } },
        },
      },
    },
  });
  if (!transmittal) throw new ApiError(404, 'Transmittal not found');
  if (transmittal.status === 'ISSUED') throw new ApiError(409, 'Transmittal is already issued');
  if (transmittal.documents.length === 0) {
    throw new ApiError(400, 'Add at least one document before issuing');
  }

  // Snapshot current revision for each document
  await prisma.$transaction(
    transmittal.documents.map((td) =>
      prisma.mdrTransmittalDocument.update({
        where: { id: td.id },
        data: { revisionAtIssue: td.document.revision ?? '0' },
      })
    )
  );

  const issuedAt = new Date();

  // Generate branded PDF cover sheet (non-fatal — issue proceeds even on PDF error)
  let coverSheetS3Key: string | undefined;
  try {
    const pdfBuffer = await generateTransmittalCoverSheet({
      transmittalNumber: transmittal.transmittalNumber,
      purpose: transmittal.purpose,
      toName: transmittal.toName,
      toEmail: transmittal.toEmail,
      fromName: transmittal.fromName,
      notes: transmittal.notes,
      issuedAt,
      projectName: transmittal.mdrProject.name,
      projectNumber: transmittal.mdrProject.projectNumber,
      clientName: transmittal.mdrProject.clientName,
      documents: transmittal.documents.map((td) => ({
        docNumber: td.document.docNumber,
        title: td.document.title,
        discipline: td.document.discipline,
        revisionAtIssue: td.document.revision ?? '0',
      })),
      branding: transmittal.mdrProject.team.branding ?? null,
    });

    coverSheetS3Key = mdrTransmittalCoverSheetKey(
      user.team.id,
      mdrId,
      transmittalId
    );

    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.s3.bucket,
        Key: coverSheetS3Key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      })
    );
  } catch (pdfErr) {
    console.error('Cover sheet generation failed (non-fatal):', pdfErr);
  }

  // Issue the transmittal
  const issued = await prisma.mdrTransmittal.update({
    where: { id: transmittalId },
    data: {
      status: 'ISSUED',
      issuedAt,
      ...(coverSheetS3Key ? { coverSheetS3Key } : {}),
    },
  });

  await mdrAuditEvent(
    user.team.id,
    user.team.name,
    user.id,
    user.name ?? '',
    'mdr_transmittal.issued',
    { id: transmittalId, name: transmittal.transmittalNumber, type: 'mdr_transmittal' }
  );

  logMdrActivity({ mdrId, userId: user.id, action: 'transmittal_issued', details: { transmittalNumber: transmittal.transmittalNumber } });
  res.status(200).json({ data: issued });
};
