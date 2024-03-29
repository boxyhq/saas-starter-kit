import { createApiKey, fetchApiKeys } from 'models/apiKey';
import { getCurrentUserWithTeam, throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { createApiKeySchema, validateWithSchema } from '@/lib/zod';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!env.teamFeatures.apiKey) {
      throw new ApiError(404, 'Not Found');
    }

    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get API keys
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUserWithTeam(req, res);

  throwIfNotAllowed(user, 'team_api_key', 'read');

  const apiKeys = await fetchApiKeys(user.team.id);

  recordMetric('apikey.fetched');

  res.json({ data: apiKeys });
};

// Create an API key
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUserWithTeam(req, res);

  throwIfNotAllowed(user, 'team_api_key', 'create');

  const { name } = validateWithSchema(createApiKeySchema, req.body);

  const apiKey = await createApiKey({
    name,
    teamId: user.team.id,
  });

  recordMetric('apikey.created');

  res.status(201).json({ data: { apiKey } });
};
