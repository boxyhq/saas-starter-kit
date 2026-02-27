import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrNotFinal, assertMdrOwnership } from '@/lib/mdr';
import { getPresignedPutUrl, mdrDocumentKeyUnsectioned } from '@/lib/s3';
import { validateWithSchema, uploadUrlSchema } from '@/lib/zod';
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
    throwIfNotAllowed(user, 'mdr', 'create');

    const { mdrId } = req.query as { mdrId: string };
    await assertMdrOwnership(mdrId, user.team.id);
    await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');
    await assertMdrNotFinal(mdrId);

    const { sha256Hash, mimeType, filename } = validateWithSchema(
      uploadUrlSchema,
      req.body
    );

    // Check for deduplication by SHA-256 hash
    if (sha256Hash) {
      const existing = await prisma.mdrDocument.findFirst({
        where: { teamId: user.team.id, sha256Hash },
        include: {
          sectionLinks: {
            include: { section: { select: { title: true } } },
            take: 1,
          },
        },
      });

      if (existing) {
        return res.status(200).json({
          data: {
            duplicate: {
              id: existing.id,
              title: existing.title,
              docNumber: existing.docNumber,
              sectionName: existing.sectionLinks[0]?.section?.title ?? null,
            },
          },
        });
      }
    }

    // Generate a temp document ID for the S3 key
    const tempDocId = crypto.randomUUID();
    const s3Key = mdrDocumentKeyUnsectioned(
      user.team.id,
      mdrId,
      tempDocId,
      filename
    );

    const uploadUrl = await getPresignedPutUrl(s3Key, mimeType);

    res.status(200).json({ data: { uploadUrl, s3Key, tempDocId } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
