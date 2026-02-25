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

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsers,
      totalTeams,
      suspendedTeams,
      totalMdrProjects,
      activeCompilations,
      failedCompilations,
      totalDocuments,
      storageAgg,
      inboundEmails30d,
      inboundAttachments30d,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.team.count(),
      prisma.team.count({ where: { suspended: true } }),
      prisma.mdrProject.count(),
      prisma.mdrCompilation.count({ where: { status: 'PROCESSING' } }),
      prisma.mdrCompilation.count({ where: { status: 'FAILED' } }),
      prisma.mdrDocument.count(),
      prisma.mdrDocument.aggregate({ _sum: { fileSize: true } }),
      prisma.mdrInboxEmail.count({ where: { receivedAt: { gte: thirtyDaysAgo } } }),
      prisma.mdrInboxAttachment.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    const totalStorageBytes = Number(storageAgg._sum.fileSize ?? 0);

    res.status(200).json({
      data: {
        totalUsers,
        newUsers,
        totalTeams,
        suspendedTeams,
        totalMdrProjects,
        activeCompilations,
        failedCompilations,
        totalDocuments,
        totalStorageBytes,
        inboundEmails30d,
        inboundAttachments30d,
      },
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
