import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { checkMdrQuota } from '@/lib/mdr';
import { validateWithSchema, createMdrProjectSchema } from '@/lib/zod';
import { logMdrActivity } from '@/lib/mdrActivityLog';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'read');

  const projects = await prisma.mdrProject.findMany({
    where: { teamId: user.team.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { sections: true, members: true } },
      compilations: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true, completedAt: true },
      },
    },
  });

  res.status(200).json({ data: projects });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'create');

  await checkMdrQuota(user.team.id);

  const data = validateWithSchema(createMdrProjectSchema, req.body);

  const project = await prisma.mdrProject.create({
    data: {
      teamId: user.team.id,
      ...data,
    },
  });

  // Auto-add creator as ADMIN
  await prisma.mdrProjectMember.create({
    data: {
      mdrProjectId: project.id,
      userId: user.id,
      role: 'ADMIN',
    },
  });

  logMdrActivity({ mdrId: project.id, userId: user.id, action: 'project_created', details: { name: project.name } });
  res.status(201).json({ data: project });
};
