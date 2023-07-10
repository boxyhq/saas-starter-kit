import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import jackson from '@/lib/jackson';
import { sendAudit } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import { getTeam, isTeamMember } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

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
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST, DELETE');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (err: any) {
    const message = err.message || 'Something went wrong';
    const status = err.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get the SAML connection for the team.
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized.');
  }

  const team = await getTeam({ slug });

  if (!(await isTeamMember(session.user.id, team.id))) {
    throw new ApiError(403, 'You are not allowed to perform this action');
  }

  const { apiController } = await jackson();

  const connections = await apiController.getConnections({
    tenant: team.id,
    product: env.product,
  });

  const response = {
    connections,
    issuer: env.saml.issuer,
    acs: `${env.appUrl}${env.saml.path}`,
  };

  res.json({ data: response });
};

// Create a SAML connection for the team.
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };
  const { metadataUrl, encodedRawMetadata } = req.body;

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized.');
  }

  const team = await getTeam({ slug });

  if (!(await isTeamMember(session.user.id, team.id))) {
    throw new ApiError(403, 'You are not allowed to perform this action');
  }

  const { apiController } = await jackson();

  const connection = await apiController.createSAMLConnection({
    encodedRawMetadata,
    metadataUrl,
    defaultRedirectUrl: env.saml.callback,
    redirectUrl: env.saml.callback,
    tenant: team.id,
    product: env.product,
  });

  sendAudit({
    action: 'sso.connection.create',
    crud: 'c',
    user: session.user,
    team,
  });

  res.status(201).json({ data: connection });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized.');
  }

  const { slug, clientID, clientSecret } = req.query as {
    slug: string;
    clientID: string;
    clientSecret: string;
  };

  const team = await getTeam({ slug });

  if (!(await isTeamMember(session.user.id, team.id))) {
    throw new ApiError(403, 'You are not allowed to perform this action');
  }

  const { apiController } = await jackson();

  await apiController.deleteConnections({ clientID, clientSecret });

  sendAudit({
    action: 'sso.connection.delete',
    crud: 'c',
    user: session.user,
    team,
  });

  res.json({ data: {} });
};
