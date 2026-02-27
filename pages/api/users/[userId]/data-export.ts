import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const session = await getServerSession(req, res, getAuthOptions(req, res));
    if (!session?.user) throw new ApiError(401, 'Unauthorized');

    const { userId } = req.query as { userId: string };

    const sessionUser = await prisma.user.findUnique({
      where: { email: (session.user as any).email },
      select: { id: true },
    });
    if (!sessionUser || sessionUser.id !== userId) throw new ApiError(403, 'Forbidden');

    const [user, teams, mdrMemberships, mdrActivityLogs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, name: true, email: true, createdAt: true, twoFactorEnabled: true,
        },
      }),
      prisma.teamMember.findMany({
        where: { userId },
        select: { role: true, createdAt: true, team: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.mdrProjectMember.findMany({
        where: { userId },
        select: { role: true, createdAt: true, mdrProject: { select: { id: true, name: true } } },
      }),
      prisma.mdrActivityLog.findMany({
        where: { userId },
        select: { action: true, details: true, createdAt: true, mdrProject: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      teams,
      mdrProjectMemberships: mdrMemberships,
      recentActivity: mdrActivityLogs,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="data-export-${userId}.json"`);
    res.status(200).send(JSON.stringify(exportData, null, 2));
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
