import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership } from '@/lib/mdr';
import { deleteS3Object } from '@/lib/s3';
import env from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    if (req.method !== 'DELETE') {
      res.setHeader('Allow', 'DELETE');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await handleDELETE(req, res);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'delete');
  const { mdrId, templateId } = req.query as { mdrId: string; templateId: string };
  await assertMdrOwnership(mdrId, user.team.id);

  const template = await prisma.mdrTemplate.findFirst({
    where: { id: templateId, mdrProjectId: mdrId },
  });
  if (!template) throw new ApiError(404, 'Template not found');

  await prisma.mdrTemplate.delete({ where: { id: templateId } });

  // Delete from S3 (best effort)
  try {
    await deleteS3Object(template.s3Key);
  } catch {
    // ignore S3 errors on delete
  }

  res.status(200).json({ data: { deleted: true } });
};
