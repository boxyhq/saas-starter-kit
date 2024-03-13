import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { ssoManager } from '@/lib/jackson/sso';
import { teamSlugSchema } from '@/lib/zod/schema';
import { getTeam } from 'models/team';
import { NextApiRequest, NextApiResponse } from 'next';

const sso = ssoManager();

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
  const { slug } = JSON.parse(req.body) as { slug: string };

  const result = teamSlugSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      422,
      `Validation Error: ${result.error.errors.map((e) => e.message)[0]}`
    );
  }

  if (!slug) {
    throw new Error('Missing the SSO identifier.');
  }

  const team = await getTeam({ slug });

  if (!team) {
    throw new Error('Team not found.');
  }

  const connections = await sso.getConnections({
    tenant: team.id,
    product: env.jackson.productId,
  });

  if (!connections || connections.length === 0) {
    throw new Error('No SSO connections found for this team.');
  }

  const data = {
    teamId: team.id,
  };

  res.json({ data });
};
