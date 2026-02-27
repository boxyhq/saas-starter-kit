import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { getPresignedPutUrl } from '@/lib/s3';
import * as z from 'zod';

const schema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

/**
 * POST /api/admin/cms/media/upload-url
 * Lightweight endpoint for Tiptap image uploads — returns a presigned PUT URL
 * without creating a MediaAsset record. The caller should follow up with
 * POST /api/admin/cms/media to register the asset after upload completes.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await requireSiteAdmin(req, res);

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: parsed.error.errors[0]?.message } });
    }

    const { filename, contentType } = parsed.data;
    const id = crypto.randomUUID();
    const ext = filename.split('.').pop() ?? 'bin';
    const s3Key = `cms/media/${id}.${ext}`;

    const uploadUrl = await getPresignedPutUrl(s3Key, contentType);

    res.status(200).json({ data: { uploadUrl, s3Key, id } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
