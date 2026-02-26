/**
 * GET /api/teams/[slug]/mdr/[mdrId]/transmittals/[transmittalId]/cover-sheet
 *
 * Returns a short-lived presigned S3 URL for the transmittal cover sheet PDF.
 * Responds 404 when no cover sheet has been generated yet.
 */
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
    await throwIfNoTeamAccess(req, res);

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res
        .status(405)
        .json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    await handleGET(req, res);
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'read');

  const { mdrId, transmittalId } = req.query as {
    mdrId: string;
    transmittalId: string;
  };

  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id);

  const transmittal = await prisma.mdrTransmittal.findFirst({
    where: { id: transmittalId, mdrProjectId: mdrId },
    select: { coverSheetS3Key: true, transmittalNumber: true },
  });

  if (!transmittal) throw new ApiError(404, 'Transmittal not found');
  if (!transmittal.coverSheetS3Key) {
    throw new ApiError(404, 'Cover sheet not yet generated for this transmittal');
  }

  const url = await getPresignedGetUrl(
    transmittal.coverSheetS3Key,
    `${transmittal.transmittalNumber}-cover-sheet.pdf`,
    300 // 5 minutes
  );

  res.status(200).json({ data: { url } });
};
