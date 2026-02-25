import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership, assertTeamNotSuspended } from '@/lib/mdr';
import { mdrAuditEvent } from '@/lib/mdrAudit';
import env from '@/lib/env';

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
      mdrProject: { select: { name: true, projectNumber: true } },
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

  // Issue the transmittal
  const issued = await prisma.mdrTransmittal.update({
    where: { id: transmittalId },
    data: { status: 'ISSUED', issuedAt: new Date() },
  });

  await mdrAuditEvent(
    user.team.id,
    user.team.name,
    user.id,
    user.name ?? '',
    'mdr_transmittal.issued',
    { id: transmittalId, name: transmittal.transmittalNumber, type: 'mdr_transmittal' }
  );

  res.status(200).json({ data: issued });
};
