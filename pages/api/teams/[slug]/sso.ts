import type { NextApiRequest, NextApiResponse } from 'next';

import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { ssoManager } from '@/lib/jackson/sso/index';
import {
  extractClientId,
  throwIfNoAccessToConnection,
} from '@/lib/guards/team-sso';

const sso = ssoManager();

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

  if ('clientID' in req.query) {
    await throwIfNoAccessToConnection({
      teamId: teamMember.teamId,
      clientId: extractClientId(req),
    });
  }

  const params =
    'clientID' in req.query
      ? { clientID: req.query.clientID as string }
      : { tenant: teamMember.teamId, product: env.jackson.productId };

  const connections = await sso.getConnections(params);

  res.json(connections);
};

// Create a SSO connection for the team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_sso', 'create');

  const connection = await sso.createConnection({
    ...req.body,
    defaultRedirectUrl: env.jackson.sso.callback + env.jackson.sso.idpLoginPath,
    redirectUrl: env.jackson.sso.callback,
    product: env.jackson.productId,
    tenant: teamMember.teamId,
  });

  sendAudit({
    action: 'sso.connection.create',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.status(201).json(connection);
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_sso', 'create');

  await throwIfNoAccessToConnection({
    teamId: teamMember.teamId,
    clientId: extractClientId(req),
  });

  await sso.updateConnection({
    ...req.body,
    tenant: teamMember.teamId,
    product: env.jackson.productId,
  });

  sendAudit({
    action: 'sso.connection.patch',
    crud: 'u',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.status(204).end();
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  throwIfNotAllowed(teamMember, 'team_sso', 'delete');

  await throwIfNoAccessToConnection({
    teamId: teamMember.teamId,
    clientId: extractClientId(req),
  });

  await sso.deleteConnection({ ...(req.query as any) });

  sendAudit({
    action: 'sso.connection.delete',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.status(204).end();
};
