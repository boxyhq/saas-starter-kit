import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await requireSiteAdmin(req, res);

    const { status, teamSlug, page = '1', limit = '50' } = req.query as {
      status?: string; teamSlug?: string; page?: string; limit?: string;
    };

    const take = Math.min(parseInt(limit), 100);
    const skip = (parseInt(page) - 1) * take;

    const where: any = {};
    if (status) where.status = status;
    if (teamSlug) where.mdrProject = { team: { slug: teamSlug } };

    const [compilations, total] = await Promise.all([
      prisma.mdrCompilation.findMany({
        where,
        include: {
          mdrProject: {
            select: {
              id: true,
              name: true,
              team: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.mdrCompilation.count({ where }),
    ]);

    res.status(200).json({ data: { compilations, total, page: parseInt(page), limit: take } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
