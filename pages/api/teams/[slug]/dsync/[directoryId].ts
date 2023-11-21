import env from '@/lib/env';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import {
  deleteDirectoryConnection,
  deleteDirectorySchema,
  getDirectoryConnections,
} from '@/lib/jackson/dsync';
import { sendAudit } from '@/lib/retraced';

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
        return await handlePATCH(req, res);
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

  const connection = await getDirectoryConnections({
    dsyncId: req.query.directoryId as string,
  });

  res.status(200).json({ data: connection });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_dsync', 'read');

  const { directoryId } = req.query as { directoryId: string };

  const { data, error } = await directorySyncController.directories.update(
    directoryId,
    req.body
  );
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_dsync', 'delete');

  const params = deleteDirectorySchema.parse(req.query);

  await deleteDirectoryConnection(params);

  sendAudit({
    action: 'dsync.connection.delete',
    crud: 'd',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.status(200).json({ data: {} });
};
