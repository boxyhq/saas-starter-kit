import env from '@/lib/env';
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

  switch (method) {
    case 'GET':
      return await handleGET(req, res);
    case 'POST':
      return await handlePOST(req, res);
    case 'DELETE':
      return await handleDELETE(req, res);
    default:
      res.setHeader('Allow', 'GET, POST');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get the SAML connection for the team.
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({
      error: { message: 'Unauthorized.' },
    });
  }

  const team = await getTeam({ slug });

  if (!(await isTeamMember(session.user.id, team.id))) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const { apiController } = await jackson();

  try {
    const connections = await apiController.getConnections({
      tenant: team.id,
      product: env.product,
    });

    const response = {
      connections,
      issuer: env.saml.issuer,
      acs: `${env.appUrl}${env.saml.path}`,
    };

    return res.json({ data: response });
  } catch (error: any) {
    const { message } = error;

    return res.status(500).json({ error: { message } });
  }
};

// Create a SAML connection for the team.
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };
  const { metadataUrl, encodedRawMetadata } = req.body;

  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({
      error: { message: 'Unauthorized.' },
    });
  }

  const team = await getTeam({ slug });

  if (!(await isTeamMember(session.user.id, team.id))) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const { apiController } = await jackson();

  try {
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

    return res.status(201).json({ data: connection });
  } catch (error: any) {
    const { message } = error;

    return res.status(500).json({ error: { message } });
  }
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
  try {
    await apiController.deleteConnections({ clientID, clientSecret });
    sendAudit({
      action: 'sso.connection.delete',
      crud: 'c',
      user: session.user,
      team,
    });
    return res.json({ data: {} });
  } catch (error: any) {
    const { message } = error;

    return res.status(500).json({ error: { message } });
  }
};
