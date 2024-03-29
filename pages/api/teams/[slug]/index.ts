import { sendAudit } from '@/lib/retraced';
import {
  deleteTeam,
  getCurrentUserWithTeam,
  getTeam,
  throwIfNoTeamAccess,
  updateTeam,
} from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';
import { updateTeamSchema, validateWithSchema } from '@/lib/zod';
import { Prisma, Team } from '@prisma/client';

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
      case 'PUT':
        await handlePUT(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, PUT, DELETE');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get a team by slug
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUserWithTeam(req, res);

  throwIfNotAllowed(user, 'team', 'read');

  const team = await getTeam({ id: user.team.id });

  recordMetric('team.fetched');

  res.status(200).json({ data: team });
};

// Update a team
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUserWithTeam(req, res);

  throwIfNotAllowed(user, 'team', 'update');

  const { name, slug, domain } = validateWithSchema(updateTeamSchema, req.body);

  let updatedTeam: Team | null = null;

  try {
    updatedTeam = await updateTeam(user.team.slug, {
      name,
      slug,
      domain,
    });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      error.meta?.target
    ) {
      const target = error.meta.target as string[];

      if (target.includes('slug')) {
        throw new ApiError(409, 'This slug is already taken for a team.');
      }

      if (target.includes('domain')) {
        throw new ApiError(
          409,
          'This domain is already associated with a team.'
        );
      }
    }

    throw error;
  }

  sendAudit({
    action: 'team.update',
    crud: 'u',
    user,
    team: user.team,
  });

  recordMetric('team.updated');

  res.status(200).json({ data: updatedTeam });
};

// Delete a team
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.deleteTeam) {
    throw new ApiError(404, 'Not Found');
  }

  const user = await getCurrentUserWithTeam(req, res);

  throwIfNotAllowed(user, 'team', 'delete');

  await deleteTeam({ id: user.team.id });

  sendAudit({
    action: 'team.delete',
    crud: 'd',
    user,
    team: user.team,
  });

  recordMetric('team.removed');

  res.status(204).end();
};
