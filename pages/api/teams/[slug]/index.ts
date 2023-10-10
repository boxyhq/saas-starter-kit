import { sendAudit } from '@/lib/retraced';
import {
  deleteTeam,
  getTeam,
  throwIfNoTeamAccess,
  updateTeam,
} from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { validateDomain } from '@/lib/common';
import { ApiError } from '@/lib/errors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
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
          error: { message: `Method ${method} Not Allowed` },
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
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const team = await getTeam({ id: teamMember.teamId });

  recordMetric('team.fetched');

  res.status(200).json({ data: team });
};

// Update a team
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'update');

  const { name, slug, domain } = req.body;

  if (domain?.length > 0 && !validateDomain(domain)) {
    throw new ApiError(400, 'Invalid domain name');
  }

  const updatedTeam = await updateTeam(teamMember.team.slug, {
    name,
    slug,
    domain,
  });

  sendAudit({
    action: 'team.update',
    crud: 'u',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('team.updated');

  res.status(200).json({ data: updatedTeam });
};

// Delete a team
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'delete');

  await deleteTeam({ id: teamMember.teamId });

  sendAudit({
    action: 'team.delete',
    crud: 'd',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('team.removed');

  res.status(200).json({ data: {} });
};
