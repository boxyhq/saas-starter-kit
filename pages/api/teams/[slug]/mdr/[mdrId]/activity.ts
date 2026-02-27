import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { assertMdrOwnership } from '@/lib/mdr';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'mdr', 'read');

    const { mdrId } = req.query as { mdrId: string };
    await assertMdrOwnership(mdrId, teamMember.team.id);

    const { page = '1', limit = '50' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(limit), 100);
    const skip = (parseInt(page) - 1) * take;

    const [logs, total] = await Promise.all([
      prisma.mdrActivityLog.findMany({
        where: { mdrId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.mdrActivityLog.count({ where: { mdrId } }),
    ]);

    res.status(200).json({ data: { logs, total, page: parseInt(page), limit: take } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
