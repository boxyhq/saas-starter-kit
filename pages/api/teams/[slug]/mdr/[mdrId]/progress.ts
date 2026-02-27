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

    const sections = await prisma.mdrSection.findMany({
      where: { mdrProjectId: mdrId },
      select: {
        id: true,
        title: true,
        requiredDocCount: true,
        _count: { select: { sectionDocuments: true } },
      },
      orderBy: { order: 'asc' },
    });

    const sectionProgress = sections.map((s) => {
      const current = s._count.sectionDocuments;
      const required = s.requiredDocCount;
      const complete = required === 0 ? true : current >= required;
      return {
        sectionId: s.id,
        title: s.title,
        current,
        required,
        complete,
        percent: required === 0 ? 100 : Math.min(100, Math.round((current / required) * 100)),
      };
    });

    const totalRequired = sectionProgress.reduce((n, s) => n + s.required, 0);
    const totalCurrent = sectionProgress.reduce((n, s) => n + Math.min(s.current, s.required || s.current), 0);
    const overallPercent = totalRequired === 0
      ? 100
      : Math.min(100, Math.round((totalCurrent / totalRequired) * 100));

    res.status(200).json({
      data: {
        sections: sectionProgress,
        overallPercent,
        totalRequired,
        totalCurrent,
      },
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
