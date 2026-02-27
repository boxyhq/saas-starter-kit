import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import env from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await requireSiteAdmin(req, res);

    if (!env.s3.accessKeyId || !env.s3.bucket) {
      return res.status(200).json({
        data: { available: false, reason: 'AWS S3 not configured' },
      });
    }

    const s3 = new S3Client({
      region: env.s3.region,
      credentials: {
        accessKeyId: env.s3.accessKeyId,
        secretAccessKey: env.s3.secretAccessKey,
      },
    });

    // Walk the bucket under the mdr/ prefix to tally size
    let totalBytes = 0;
    let totalObjects = 0;
    let continuationToken: string | undefined;

    do {
      const cmd = new ListObjectsV2Command({
        Bucket: env.s3.bucket,
        Prefix: 'mdr/',
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });
      const response = await s3.send(cmd);

      for (const obj of response.Contents ?? []) {
        totalBytes += obj.Size ?? 0;
        totalObjects++;
      }

      continuationToken = response.NextContinuationToken;

      // Safety limit: stop after 100k objects to prevent very long scans
      if (totalObjects >= 100_000) break;
    } while (continuationToken);

    res.status(200).json({
      data: {
        available: true,
        bucket: env.s3.bucket,
        region: env.s3.region,
        totalBytes,
        totalObjects,
      },
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
