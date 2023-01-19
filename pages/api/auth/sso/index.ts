import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { prisma } from '@/lib/prisma';
import type { OAuthReq } from '@boxyhq/saml-jackson';
import type { NextApiRequest, NextApiResponse } from 'next';

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

  const samlConfig = await apiController.getConfig({
    tenant: team.id,
    product: env.product,
  });

  // Check if the SAML config exists for the team
  if (Object.keys(samlConfig).length === 0) {
    return res.status(400).json({
      error: {
        message: 'SAML SSO is not configured for this team.',
      },
    });
  }

  const response = await oauthController.authorize({
    tenant: team.id,
    product: env.product,
    redirect_uri: env.saml.callback,
    state: 'some-random-state',
  } as OAuthReq);

  return res.status(200).json({ data: response });
};
