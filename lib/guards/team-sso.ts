import type { NextApiRequest } from 'next';

import { ApiError } from '../errors';
import { ssoManager } from '@/lib/jackson/sso/index';

type GuardOptions = {
  teamId: string;
  clientId: string | null;
};

// Extract the client ID from the request.
export const extractClientId = (req: NextApiRequest) => {
  let clientId: string | null = null;

  if (req.method === 'GET' || req.method === 'DELETE') {
    clientId = req.query.clientID as string;
  } else if (req.method === 'PATCH') {
    clientId = req.body.clientID as string;
  }

  return clientId;
};

// Throw if the user is not allowed to access given SSO connection.
export const throwIfNoAccessToConnection = async ({
  teamId,
  clientId,
}: GuardOptions) => {
  if (!clientId) {
    return;
  }

  const sso = ssoManager();

  const connections = await sso.getConnections({
    clientID: clientId,
  });

  if (!connections || connections.length === 0) {
    return;
  }

  if (connections[0].tenant === teamId) {
    return;
  }

  throw new ApiError(
    403,
    `Forbidden. You don't have access to this sso connection.`
  );
};
