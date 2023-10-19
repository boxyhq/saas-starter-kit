import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import jackson from '@/lib/jackson';
import { sendAudit } from '@/lib/retraced';
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
    const message = err.message || 'Something went wrong';
    const status = err.status || 500;
    console.error(err);
    res.status(status).json({ error: { message } });
  }
}

// Get the SAML connection for the team.
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_sso', 'read');

  const { apiController } = await jackson();

  const connections = await apiController.getConnections({
    tenant: teamMember.teamId,
    product: env.product,
  });

  res.json({ data: connections });
};

// Create a SAML connection for the team.
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_sso', 'create');

  const { metadataUrl, encodedRawMetadata } = req.body;

  const { apiController } = await jackson();

  const connection = await apiController.createSAMLConnection({
    encodedRawMetadata,
    metadataUrl,
    defaultRedirectUrl: env.saml.callback,
    redirectUrl: env.saml.callback,
    tenant: teamMember.teamId,
    product: env.product,
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

  const {
    metadataUrl,
    encodedRawMetadata,
    clientID,
    clientSecret,
    deactivated,
  } = req.body;

  const { apiController } = await jackson();

  const connection = await apiController.updateSAMLConnection({
    clientID,
    clientSecret,
    encodedRawMetadata,
    metadataUrl,
    deactivated,
    defaultRedirectUrl: env.saml.callback,
    redirectUrl: env.saml.callback,
    tenant: teamMember.teamId,
    product: env.product,
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

  const { clientID, clientSecret } = req.query as {
    clientID: string;
    clientSecret: string;
  };

  const { apiController } = await jackson();

  await apiController.deleteConnections({ clientID, clientSecret });

  sendAudit({
    action: 'sso.connection.delete',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  res.json({ data: {} });
};
