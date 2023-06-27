import { getSession } from '@/lib/session';
import { deleteApiKey } from 'models/apiKey';
import { hasTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'DELETE':
        return await handleDELETE(req, res);
      default:
        res.setHeader('Allow', ['DELETE']);
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

// Delete an API key
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { slug, apiKeyId } = req.query as { slug: string; apiKeyId: string };

  if (!(await hasTeamAccess({ userId: session.user.id, teamSlug: slug }))) {
    throw new Error('You are not allowed to perform this action');
  }

  await deleteApiKey(apiKeyId);

  return res.json({ data: {} });
};
