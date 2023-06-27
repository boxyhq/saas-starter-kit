import { createApiKey, fetchApiKeys } from '@/core/lib/api-keys';
import { getSession } from '@/lib/session';
import { getTeam, hasTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGET(req, res);
      case 'POST':
        return await handlePOST(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({
          data: null,
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';

    res.status(500).json({ error: { message } });
  }
}

// Get API keys
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { slug } = req.query as { slug: string };

  if (!(await hasTeamAccess({ userId: session.user.id, teamSlug: slug }))) {
    throw new Error('You are not allowed to perform this action');
  }

  const team = await getTeam({ slug });
  const apiKeys = await fetchApiKeys(team.id);

  return res.json({ data: apiKeys });
};

// Create an API key
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { slug } = req.query as { slug: string };
  const { name } = JSON.parse(req.body) as { name: string };

  if (!(await hasTeamAccess({ userId: session.user.id, teamSlug: slug }))) {
    throw new Error('You are not allowed to perform this action');
  }

  const team = await getTeam({ slug });
  const apiKey = await createApiKey({
    name,
    teamId: team.id,
  });

  return res.status(201).json({ data: { apiKey } });
};
