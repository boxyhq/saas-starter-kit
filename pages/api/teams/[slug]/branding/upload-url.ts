import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { getPresignedPutUrl, mdrLogoKey } from '@/lib/s3';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

    await throwIfNoTeamAccess(req, res);
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, 'team', 'update');

    const { mimeType, filename } = req.body as {
      mimeType: string;
      filename: string;
    };

    if (!mimeType || !filename) {
      throw new ApiError(400, 'mimeType and filename are required.');
    }

    const s3Key = mdrLogoKey(user.team.id, filename);
    const uploadUrl = await getPresignedPutUrl(s3Key, mimeType);

    // Pre-save the s3Key so subsequent PATCH to /branding can reference it
    await prisma.teamBranding.upsert({
      where: { teamId: user.team.id },
      create: { teamId: user.team.id, logoS3Key: s3Key },
      update: { logoS3Key: s3Key },
    });

    res.status(200).json({ data: { uploadUrl, s3Key } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
