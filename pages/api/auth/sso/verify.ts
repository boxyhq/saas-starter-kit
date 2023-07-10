import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { getTeam } from 'models/team';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (err: any) {
    res.status(400).json({
      error: { message: err.message },
    });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { apiController } = await jackson();

  const { slug } = JSON.parse(req.body) as { slug: string };

  if (!slug) {
    throw new Error('Missing the SSO identifier.');
  }

  const team = await getTeam({ slug });

  if (!team) {
    throw new Error('Team not found.');
  }

  const connections = await apiController.getConnections({
    tenant: team.id,
    product: env.product,
  });

  if (!connections || connections.length === 0) {
    throw new Error('No SSO connections found for this team.');
  }

  const data = {
    teamId: team.id,
  };

  res.json({ data });
};
