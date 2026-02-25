import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership, assertTeamNotSuspended } from '@/lib/mdr';
import { getPresignedPutUrl, mdrTemplateKey } from '@/lib/s3';
import env from '@/lib/env';
import * as z from 'zod';

const createSchema = z.object({
  title: z.string().min(1),
  purpose: z.enum(['COVER', 'DIVIDER', 'BODY']).default('DIVIDER'),
  mdrSectionId: z.string().uuid().optional(),
  mimeType: z.string(),
  filename: z.string(),
  fileSize: z.number().int().positive(),
  requestUploadUrl: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      case 'POST': await handlePOST(req, res); break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'read');
  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);

  const templates = await prisma.mdrTemplate.findMany({
    where: { mdrProjectId: mdrId },
    include: { mdrSection: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'asc' },
  });

  res.status(200).json({ data: templates });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'create');
  await assertTeamNotSuspended(user.team.id);
  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Validation error');
  const { title, purpose, mdrSectionId, mimeType, filename, fileSize } = parsed.data;

  const templateId = crypto.randomUUID();
  const s3Key = mdrTemplateKey(user.team.id, mdrId, templateId, filename);
  const uploadUrl = await getPresignedPutUrl(s3Key, mimeType);

  // Create template record (will be updated when upload is confirmed)
  const template = await prisma.mdrTemplate.create({
    data: {
      id: templateId,
      mdrProjectId: mdrId,
      mdrSectionId: mdrSectionId || null,
      title,
      purpose,
      s3Key,
      fileSize: BigInt(fileSize),
      mimeType,
    },
  });

  res.status(201).json({ data: { templateId: template.id, uploadUrl } });
};
