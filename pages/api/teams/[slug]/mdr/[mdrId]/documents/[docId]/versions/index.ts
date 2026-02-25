import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership } from '@/lib/mdr';
import env from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await handleGET(req, res);
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

  const document = await prisma.mdrDocument.findFirst({
    where: { id: docId, mdrProjectId: mdrId },
    select: { id: true },
  });
  if (!document) throw new ApiError(404, 'Document not found');

  const versions = await prisma.mdrDocumentVersion.findMany({
    where: { documentId: docId },
    orderBy: { uploadedAt: 'desc' },
  });

  res.status(200).json({ data: versions });
};
