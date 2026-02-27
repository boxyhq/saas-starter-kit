import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
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

    const { confirm } = req.body as { confirm?: boolean };
    if (confirm !== true) throw new ApiError(400, 'Set confirm: true to proceed with account deletion');

    // Find teams where the user is the sole OWNER — must transfer or delete the team first
    const ownedTeams = await prisma.teamMember.findMany({
      where: { userId, role: 'OWNER' },
      select: { teamId: true },
    });

    for (const { teamId } of ownedTeams) {
      const otherOwners = await prisma.teamMember.count({
        where: { teamId, role: 'OWNER', userId: { not: userId } },
      });
      if (otherOwners === 0) {
        // Delete the team and all its MDR data via cascade
        await prisma.team.delete({ where: { id: teamId } });
      }
    }

    // Delete the user — cascade handles sessions, accounts, team memberships
    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({ data: { deleted: true } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
