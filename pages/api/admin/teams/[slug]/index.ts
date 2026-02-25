import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };
  const team = await prisma.team.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      suspended: true,
      mdrQuotaOverride: true,
      members: {
        select: {
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      mdrProjects: {
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          _count: { select: { sections: true } },
        },
      },
    },
  });

  if (!team) throw new ApiError(404, 'Team not found');
  res.status(200).json({ data: team });
};
