import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { findOrCreateApp, findWebhook, updateWebhook } from '@/lib/svix';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { EndpointIn } from 'svix';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';
import {
  getWebhookSchema,
  updateWebhookEndpointSchema,
  validateWithSchema,
} from '@/lib/zod';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, 'Not Found');
    }

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
    const message = err?.body?.detail || err.message || 'Something went wrong';
    const status = err.status || err.code || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get a Webhook
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_webhook', 'read');

  const { endpointId } = validateWithSchema(
    getWebhookSchema,
    req.query as {
      endpointId: string;
    }
  );

  const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

  if (!app) {
    throw new ApiError(200, 'Bad request.');
  }

  const webhook = await findWebhook(app.id, endpointId as string);

  recordMetric('webhook.fetched');

  res.status(200).json({ data: webhook });
};

// Update a Webhook
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_webhook', 'update');

  const { name, url, eventTypes, endpointId } = validateWithSchema(
    updateWebhookEndpointSchema,
    {
      ...req.query,
      ...req.body,
    }
  );

  const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

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
  // Checks if the webhook exists or throws an error
  await findWebhook(app.id, endpointId);

  const webhook = await updateWebhook(app.id, endpointId, data);

  sendAudit({
    action: 'webhook.update',
    crud: 'u',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('webhook.updated');

  res.status(200).json({ data: webhook });
};
