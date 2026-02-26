import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { deleteS3Object } from '@/lib/s3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'PATCH': await handlePATCH(req, res); break;
      case 'DELETE': await handleDELETE(req, res); break;
      default:
        res.setHeader('Allow', 'PATCH, DELETE');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const getAsset = async (assetId: string) => {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
  if (!asset) throw new ApiError(404, 'Media asset not found');
  return asset;
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const { assetId } = req.query as { assetId: string };
  await getAsset(assetId);
  const { alt } = req.body as { alt?: string };

  const asset = await prisma.mediaAsset.update({
    where: { id: assetId },
    data: { alt: alt ?? null },
  });
  res.status(200).json({ data: asset });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { assetId } = req.query as { assetId: string };
  const asset = await getAsset(assetId);

  await prisma.mediaAsset.delete({ where: { id: assetId } });

  try {
    await deleteS3Object(asset.s3Key);
  } catch {
    // best-effort S3 delete
  }

  res.status(200).json({ data: { deleted: true } });
};
