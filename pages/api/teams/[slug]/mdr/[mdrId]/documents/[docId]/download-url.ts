import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import { getPresignedGetUrl } from '@/lib/s3';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

    await throwIfNoTeamAccess(req, res);
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, 'mdr', 'read');

    const { mdrId, docId } = req.query as { mdrId: string; docId: string };
    await assertMdrOwnership(mdrId, user.team.id);
    await assertMdrAccess(mdrId, user.id, user.team.id);

    const doc = await prisma.mdrDocument.findUniqueOrThrow({
      where: { id: docId, mdrProjectId: mdrId },
      select: { s3Key: true, pdfS3Key: true, originalName: true },
    });

    const s3Key = doc.pdfS3Key ?? doc.s3Key;
    const url = await getPresignedGetUrl(s3Key, doc.originalName);

    res.status(200).json({ data: { url } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
