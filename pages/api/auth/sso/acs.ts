import type { NextApiRequest, NextApiResponse } from 'next';

import handlerProxy from '../../oauth/saml';

// This is a legacy endpoint that is maintained for backwards compatibility.
// The new endpoint is pages/api/oauth/saml.ts

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return handlerProxy(req, res);
}
