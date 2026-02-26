import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { getPresignedPutUrl } from '@/lib/s3';
import * as z from 'zod';

const createSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  alt: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      case 'POST': await handlePOST(req, res, admin.id); break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const page = parseInt(String(req.query.page ?? '1'));
  const limit = Math.min(parseInt(String(req.query.limit ?? '50')), 100);
  const q = req.query.q as string | undefined;

  const where = q ? { filename: { contains: q, mode: 'insensitive' as const } } : {};

  const [assets, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.mediaAsset.count({ where }),
  ]);

  res.status(200).json({ data: { assets, total, page, limit } });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse, adminId: string) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: parsed.error.errors[0]?.message } });
  }

  const assetId = crypto.randomUUID();
  const ext = parsed.data.filename.split('.').pop() ?? 'bin';
  const s3Key = `cms/media/${assetId}.${ext}`;

  const uploadUrl = await getPresignedPutUrl(s3Key, parsed.data.mimeType);

  const asset = await prisma.mediaAsset.create({
    data: {
      id: assetId,
      filename: parsed.data.filename,
      s3Key,
      mimeType: parsed.data.mimeType,
      fileSize: BigInt(parsed.data.fileSize),
      width: parsed.data.width,
      height: parsed.data.height,
      alt: parsed.data.alt,
      uploadedBy: adminId,
    },
  });

  res.status(201).json({ data: { asset, uploadUrl } });
};
