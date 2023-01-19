import { getSession } from '@/lib/session';
import {
  createWebhook,
  deleteWebhook,
  findOrCreateApp,
  listWebhooks,
} from '@/lib/svix';
import { getTeam, isTeamMember } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { EndpointIn } from 'svix';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handlePOST(req, res);
    case 'GET':
      return handleGET(req, res);
    case 'DELETE':
      return handleDELETE(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Create a Webhook endpoint
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const slug = req.query.slug as string;
  const { name, url, eventTypes } = req.body;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(200).json({
      data: null,
      error: { message: 'Bad request.' },
    });
  }

  const app = await findOrCreateApp(team.name, team.id);

  // TODO: The endpoint URL must be HTTPS.

  const data: EndpointIn = {
    description: name,
    url,
    version: 1,
  };

  if (eventTypes.length > 0) {
    data['filterTypes'] = eventTypes;
  }

  const endpoint = await createWebhook(app.id, data);

  return res.status(200).json({ data: endpoint, error: null });
};

// Get all webhooks created by a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const slug = req.query.slug as string;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(200).json({
      data: null,
      error: { message: 'Bad request.' },
    });
  }

  const app = await findOrCreateApp(team.name, team.id);

  const webhooks = await listWebhooks(app.id);

  return res.status(200).json({ data: webhooks.data, error: null });
};

// Delete a webhook
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const slug = req.query.slug as string;
  const { webhookId } = req.body;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(200).json({
      data: null,
      error: { message: 'Bad request.' },
    });
  }

  const app = await findOrCreateApp(team.name, team.id);

  if (app.uid != team.id) {
    return res.status(200).json({
      data: null,
      error: { message: 'Bad request.' },
    });
  }

  await deleteWebhook(app.id, webhookId);

  return res.status(200).json({ data: {}, error: null });
};
