import type { NextApiRequest, NextApiResponse } from 'next';
import type { DirectorySyncRequest } from '@boxyhq/saml-jackson';

import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { extractAuthToken } from '@/lib/server-common';
import { handleEvents } from '@/lib/jackson/dsyncEvents';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!env.teamFeatures.dsync) {
    res.status(404).json({ error: { message: 'Not Found' } });
  }

  const { directorySync } = await jackson();

  const { method, query, body } = req;

  const directory = query.directory as string[];
  const [directoryId, path, resourceId] = directory;

  // Handle the SCIM API requests
  const request: DirectorySyncRequest = {
    method: method as string,
    body: body ? JSON.parse(body) : undefined,
    directoryId,
    resourceId,
    resourceType: path === 'Users' ? 'users' : 'groups',
    apiSecret: extractAuthToken(req),
    query: {
      count: req.query.count ? parseInt(req.query.count as string) : undefined,
      startIndex: req.query.startIndex
        ? parseInt(req.query.startIndex as string)
        : undefined,
      filter: req.query.filter as string,
    },
  };

  const { status, data } = await directorySync.requests.handle(
    request,
    handleEvents
  );

  res.status(status).json(data);
}
