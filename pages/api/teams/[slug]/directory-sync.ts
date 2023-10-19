import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { sendAudit } from '@/lib/retraced';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    if (!env.teamFeatures.dsync) {
      throw new ApiError(404, 'Not Found');
    }

    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
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

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_dsync', 'read');

  const { directorySync } = await jackson();

  const { data, error } = await directorySync.directories.getByTenantAndProduct(
    teamMember.teamId,
    env.product
  );

  if (error) {
    throw error;
  }

  res.status(200).json({ data });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_dsync', 'create');

  const { name, provider } = req.body;

  const { directorySync } = await jackson();

  const { data, error } = await directorySync.directories.create({
    name,
    type: provider,
    tenant: teamMember.teamId,
    product: env.product,
  });

  if (error) {
    throw error;
  }

  sendAudit({
    action: 'dsync.connection.create',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.status(201).json({ data });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_dsync', 'delete');

  const { dsyncId } = req.query as { dsyncId: string };

  const { directorySync } = await jackson();

  await directorySync.directories.delete(dsyncId);

  sendAudit({
    action: 'dsync.connection.delete',
    crud: 'd',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.status(200).json({ data: {} });
};
