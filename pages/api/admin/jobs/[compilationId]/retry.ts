import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { compilationQueue } from '@/lib/mdrQueue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }

    const { compilationId } = req.query as { compilationId: string };
    const compilation = await prisma.mdrCompilation.findUnique({
      where: { id: compilationId },
      include: { mdrProject: { select: { teamId: true } } },
    });

    if (!compilation) throw new ApiError(404, 'Compilation not found');
    if (compilation.status !== 'FAILED') {
      throw new ApiError(400, 'Only FAILED compilations can be retried');
    }

    // Reset to PENDING
    await prisma.mdrCompilation.update({
      where: { id: compilationId },
      data: { status: 'PENDING', errorMessage: null, startedAt: null, completedAt: null },
    });

    // Re-enqueue
    const job = await compilationQueue.add('compile', {
      mdrProjectId: compilation.mdrProjectId,
      compilationId: compilation.id,
      teamId: compilation.mdrProject.teamId,
    });

    await prisma.mdrCompilation.update({
      where: { id: compilationId },
      data: { jobId: String(job.id) },
    });

    res.status(200).json({ data: { jobId: job.id } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
