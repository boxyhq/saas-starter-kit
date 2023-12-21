import env from '@/lib/env';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import { dsyncManager } from '@/lib/jackson/dsync';
import { sendAudit } from '@/lib/retraced';

const dsync = dsyncManager();

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
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, PATCH, DELETE');
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

  const connection = await dsync.getConnections({
    dsyncId: req.query.directoryId as string,
  });

  res.status(200).json(connection);
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_dsync', 'read');

  const body = { ...req.query, ...req.body };

  const connection = await dsync.updateConnection(body);

  res.status(200).json(connection);
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_dsync', 'delete');

  const params = req.query;

  const data = await dsync.deleteConnection(params);

  sendAudit({
    action: 'dsync.connection.delete',
    crud: 'd',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.status(200).json(data);
};
