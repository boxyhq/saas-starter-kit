import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership, assertTeamNotSuspended } from '@/lib/mdr';
import env from '@/lib/env';
import * as z from 'zod';

const addSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      case 'POST': await handlePOST(req, res); break;
      case 'DELETE': await handleDELETE(req, res); break;
      default:
        res.setHeader('Allow', 'GET, POST, DELETE');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const getTransmittal = async (mdrId: string, transmittalId: string, teamId: string) => {
  await assertMdrOwnership(mdrId, teamId);
  const transmittal = await prisma.mdrTransmittal.findFirst({
    where: { id: transmittalId, mdrProjectId: mdrId },
  });
  if (!transmittal) throw new ApiError(404, 'Transmittal not found');
  return transmittal;
};

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'read');
  const { mdrId, transmittalId } = req.query as { mdrId: string; transmittalId: string };
  await getTransmittal(mdrId, transmittalId, user.team.id);

  const docs = await prisma.mdrTransmittalDocument.findMany({
    where: { transmittalId },
    include: { document: true },
    orderBy: { document: { docNumber: 'asc' } },
  });

  res.status(200).json({ data: docs });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'update');
  await assertTeamNotSuspended(user.team.id);
  const { mdrId, transmittalId } = req.query as { mdrId: string; transmittalId: string };
  const transmittal = await getTransmittal(mdrId, transmittalId, user.team.id);
  if (transmittal.status === 'ISSUED') throw new ApiError(400, 'Cannot modify an issued transmittal');

  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');

  // Get current revision of each document
  const documents = await prisma.mdrDocument.findMany({
    where: { id: { in: parsed.data.documentIds }, mdrProjectId: mdrId },
    select: { id: true, revision: true },
  });

  const created = await prisma.$transaction(
    documents.map((doc) =>
      prisma.mdrTransmittalDocument.upsert({
        where: { transmittalId_documentId: { transmittalId, documentId: doc.id } },
        create: { transmittalId, documentId: doc.id, revisionAtIssue: doc.revision ?? '0' },
        update: { revisionAtIssue: doc.revision ?? '0' },
      })
    )
  );

  res.status(200).json({ data: created });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'update');
  await assertTeamNotSuspended(user.team.id);
  const { mdrId, transmittalId } = req.query as { mdrId: string; transmittalId: string };
  const transmittal = await getTransmittal(mdrId, transmittalId, user.team.id);
  if (transmittal.status === 'ISSUED') throw new ApiError(400, 'Cannot modify an issued transmittal');

  const { documentId } = req.body as { documentId: string };
  if (!documentId) throw new ApiError(400, 'documentId required');

  await prisma.mdrTransmittalDocument.deleteMany({
    where: { transmittalId, documentId },
  });

  res.status(200).json({ data: { deleted: true } });
};
