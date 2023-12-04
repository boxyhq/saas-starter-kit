import env from '@/lib/env';
import { sendAudit } from '@/lib/retraced';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import {
  createDirectoryConnection,
  getDirectoryConnections,
} from '@/lib/jackson/dsync';

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

      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    console.error(error);

    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_dsync', 'read');

  const connections = await getDirectoryConnections({
    tenant: teamMember.teamId,
  });

  res.status(200).json({ data: connections });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_dsync', 'create');

  const body = req.body;

  const connection = await createDirectoryConnection({
    ...body,
    tenant: teamMember.teamId,
  });

  sendAudit({
    action: 'dsync.connection.create',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.status(201).json({ data: connection });
};
