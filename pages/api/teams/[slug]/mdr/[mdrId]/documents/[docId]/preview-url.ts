import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { assertMdrOwnership } from '@/lib/mdr';
import { getPresignedGetUrl } from '@/lib/s3';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'mdr', 'read');

    const { mdrId, docId } = req.query as { mdrId: string; docId: string };
    await assertMdrOwnership(mdrId, teamMember.team.id);

    const doc = await prisma.mdrDocument.findFirst({
      where: { id: docId, mdrProjectId: mdrId },
      select: { id: true, pdfS3Key: true, s3Key: true, originalName: true, mimeType: true },
    });

    if (!doc) throw new ApiError(404, 'Document not found');

    // Prefer the converted PDF; fall back to the original if it's already a PDF
    const previewKey = doc.pdfS3Key ?? (doc.mimeType === 'application/pdf' ? doc.s3Key : null);
    if (!previewKey) {
      throw new ApiError(422, 'No PDF preview available for this document yet');
    }

    const url = await getPresignedGetUrl(previewKey, undefined, 300); // 5 min

    res.status(200).json({ data: { url, filename: doc.originalName } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
