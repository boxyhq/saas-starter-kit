import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const { userId } = req.query as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        suspended: true,
        twoFactorEnabled: true,
        teamMembers: {
          select: {
            role: true,
            team: {
              select: {
                id: true, name: true, slug: true, suspended: true,
                mdrProjects: { select: { id: true, name: true, status: true }, take: 5 },
              },
            },
          },
        },
        mdrProjectMemberships: {
          select: {
            role: true,
            mdrProject: { select: { id: true, name: true } },
          },
          take: 10,
        },
      },
    });

    if (!user) throw new ApiError(404, 'User not found');
    res.status(200).json({ data: user });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
