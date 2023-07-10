import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import { findOrCreateApp, findWebhook, updateWebhook } from '@/lib/svix';
import { getTeam, isTeamMember } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { EndpointIn } from 'svix';

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
      case 'PUT':
        await handlePUT(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, PUT');
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

// Get a Webhook
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug, endpointId } = req.query as {
    slug: string;
    endpointId: string;
  };

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized.');
  }

  const team = await getTeam({ slug });

  if (!(await isTeamMember(session.user.id, team.id))) {
    throw new ApiError(200, 'Bad request.');
  }

  const app = await findOrCreateApp(team.name, team.id);

  if (!app) {
    throw new ApiError(200, 'Bad request.');
  }

  const webhook = await findWebhook(app.id, endpointId as string);

  res.status(200).json({ data: webhook });
};

// Update a Webhook
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug, endpointId } = req.query as {
    slug: string;
    endpointId: string;
  };

  const { name, url, eventTypes } = req.body;

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(session.user.id, team.id))) {
    throw new ApiError(200, 'Bad request.');
  }

  const app = await findOrCreateApp(team.name, team.id);

  if (!app) {
    throw new ApiError(200, 'Bad request.');
  }

  const data: EndpointIn = {
    description: name,
    url,
    version: 1,
  };

  if (eventTypes.length > 0) {
    data['filterTypes'] = eventTypes;
  }

  const webhook = await updateWebhook(app.id, endpointId, data);

  sendAudit({
    action: 'webhook.update',
    crud: 'u',
    user: session.user,
    team,
  });

  res.status(200).json({ data: webhook });
};
