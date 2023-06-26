import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { prisma } from '@/lib/prisma';
import type { OAuthReq } from '@boxyhq/saml-jackson';
import type { NextApiRequest, NextApiResponse } from 'next';

// TODO: Remove this endpoint

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return await handlePOST(req, res);
    default:
      res.setHeader('Allow', 'POST');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.body;
  const { apiController, oauthController } = await jackson();

  const team = await prisma.team.findUnique({
    where: { slug },
  });

  if (!team) {
    return res.status(404).json({
      error: {
        message: 'The team does not exist in the database.',
      },
    });
  }

  const connections = await apiController.getConnections({
    tenant: team.id,
    product: env.product,
  });

  // Check if the SSO connections exists for the team
  if (connections.length === 0) {
    return res.status(400).json({
      error: {
        message: 'SSO is not configured for this team.',
      },
    });
  }

  let redirectUrl = '';

  // If there are multiple SSO connections, redirect the user to the IdP selection page
  if (connections.length > 1) {
    redirectUrl = `/auth/sso/idp-select?teamId=${team.id}`;
  } else {
    const response = await oauthController.authorize({
      tenant: team.id,
      product: env.product,
      redirect_uri: env.saml.callback,
      state: 'some-random-state',
    } as OAuthReq);

    if (!response || !response.redirect_url) {
      throw new Error('There was an error with the SSO request.');
    }

    redirectUrl = response.redirect_url;
  }

  return res.status(200).json({ data: { redirect_url: redirectUrl } });
};
