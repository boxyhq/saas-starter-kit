import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import {
  createSSOConnection,
  deleteSSOConnections,
  getSSOConnections,
  updateSSOConnection,
  createSSOSchema,
  updateSSOSchema,
  deleteSSOSchema,
} from '@/lib/jackson/sso';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    if (!env.teamFeatures.sso) {
      throw new ApiError(404, 'Not Found');
    }

    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (err: any) {
    console.error(err);

    const message = err.message || 'Something went wrong';
    const status = err.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get the SSO connection for the team.
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_sso', 'read');

  if (req.query.clientID) {
    const connections = await getSSOConnections({
      clientID: req.query.clientID as string,
    });
    return res.json({ data: connections });
  }

  const connections = await getSSOConnections({
    tenant: teamMember.teamId,
  });

  res.json({ data: connections });
};

// Create a SSO connection for the team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_sso', 'create');

  const params = createSSOSchema.parse(req.body);

  const connection = await createSSOConnection({
    ...params,
    tenant: teamMember.teamId,
  });

  sendAudit({
    action: 'sso.connection.create',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.status(201).json({ data: connection });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_sso', 'create');

  const params = updateSSOSchema.parse(req.body);

  const connection = await updateSSOConnection({
    ...params,
    tenant: teamMember.teamId,
  });

  sendAudit({
    action: 'sso.connection.patch',
    crud: 'u',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.status(200).json({ data: connection });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_sso', 'delete');

  const params = deleteSSOSchema.parse(req.query);

  await deleteSSOConnections(params);

  sendAudit({
    action: 'sso.connection.delete',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.json({ data: {} });
};
