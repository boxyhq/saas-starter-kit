import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { assertMdrOwnership, assertMdrNotFinal } from '@/lib/mdr';
import { deleteS3Object } from '@/lib/s3';
import { ApiError } from '@/lib/errors';
import { MdrDocumentStatus } from '@prisma/client';
import * as z from 'zod';

const schema = z.object({
  docIds: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum(['delete', 'set_status']),
  status: z.string().optional(),  // required when action === 'set_status'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'mdr', 'update');

    const { mdrId } = req.query as { mdrId: string };
    await assertMdrOwnership(mdrId, teamMember.team.id);
    await assertMdrNotFinal(mdrId);

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');
    const { docIds, action, status } = parsed.data;

    // Verify all docs belong to this MDR project
    const docs = await prisma.mdrDocument.findMany({
      where: { id: { in: docIds }, mdrProjectId: mdrId },
      select: { id: true, s3Key: true, pdfS3Key: true },
    });

    if (docs.length !== docIds.length) {
      throw new ApiError(400, 'Some documents do not belong to this project');
    }

    if (action === 'delete') {
      // Remove section links
      await prisma.mdrSectionDocument.deleteMany({ where: { documentId: { in: docIds } } });

      // Delete S3 objects in parallel (best-effort)
      await Promise.allSettled(
        docs.flatMap((d) => [
          d.s3Key ? deleteS3Object(d.s3Key) : Promise.resolve(),
          d.pdfS3Key ? deleteS3Object(d.pdfS3Key) : Promise.resolve(),
        ])
      );

      await prisma.mdrDocument.deleteMany({ where: { id: { in: docIds } } });

      return res.status(200).json({ data: { affected: docs.length, action: 'delete' } });
    }

    if (action === 'set_status') {
      if (!status) throw new ApiError(400, 'status is required for set_status action');
      await prisma.mdrDocument.updateMany({
        where: { id: { in: docIds } },
        data: { status: status as MdrDocumentStatus },
      });
      return res.status(200).json({ data: { affected: docs.length, action: 'set_status', status } });
    }

    throw new ApiError(400, 'Unknown action');
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
