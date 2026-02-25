import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', 'PATCH');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const { slug } = req.query as { slug: string };
    const { mdrQuotaOverride } = req.body as { mdrQuotaOverride: number | null };

    if (mdrQuotaOverride !== null && (typeof mdrQuotaOverride !== 'number' || mdrQuotaOverride < -1)) {
      throw new ApiError(400, 'mdrQuotaOverride must be a number >= -1 (or null to remove override)');
    }

    const team = await prisma.team.update({
      where: { slug },
      data: { mdrQuotaOverride },
      select: { id: true, slug: true, mdrQuotaOverride: true },
    });

    res.status(200).json({ data: team });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
