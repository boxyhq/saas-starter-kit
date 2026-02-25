import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership, checkMdrQuota } from '@/lib/mdr';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

    await throwIfNoTeamAccess(req, res);
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, 'mdr', 'create');

    const { mdrId } = req.query as { mdrId: string };
    await assertMdrOwnership(mdrId, user.team.id);
    await assertMdrAccess(mdrId, user.id, user.team.id, 'ADMIN');

    await checkMdrQuota(user.team.id);

    const sourceProject = await prisma.mdrProject.findUniqueOrThrow({
      where: { id: mdrId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    const { name } = req.body as { name?: string };
    const newName = name || `${sourceProject.name} (Clone)`;

    // Create new project
    const newProject = await prisma.mdrProject.create({
      data: {
        teamId: user.team.id,
        name: newName,
        description: sourceProject.description,
        clientName: sourceProject.clientName,
        projectNumber: sourceProject.projectNumber,
        discipline: sourceProject.discipline,
      },
    });

    // Auto-add creator as ADMIN
    await prisma.mdrProjectMember.create({
      data: {
        mdrProjectId: newProject.id,
        userId: user.id,
        role: 'ADMIN',
      },
    });

    // Clone sections (structure only, no documents)
    const sectionIdMap = new Map<string, string>();

    // First pass: create all sections without parentSectionId
    for (const section of sourceProject.sections) {
      const newSection = await prisma.mdrSection.create({
        data: {
          mdrProjectId: newProject.id,
          title: section.title,
          order: section.order,
          docNumberFormat: section.docNumberFormat,
          requiredDocCount: section.requiredDocCount,
        },
      });
      sectionIdMap.set(section.id, newSection.id);
    }

    // Second pass: fix parentSectionId references
    for (const section of sourceProject.sections) {
      if (section.parentSectionId) {
        const newParentId = sectionIdMap.get(section.parentSectionId);
        const newSectionId = sectionIdMap.get(section.id);
        if (newParentId && newSectionId) {
          await prisma.mdrSection.update({
            where: { id: newSectionId },
            data: { parentSectionId: newParentId },
          });
        }
      }
    }

    res.status(201).json({ data: newProject });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
