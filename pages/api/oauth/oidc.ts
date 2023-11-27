import { NextApiRequest, NextApiResponse } from 'next';

import jackson, { OIDCAuthzResponsePayload } from '@/lib/jackson';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      throw { message: 'Method not allowed', statusCode: 405 };
    }

    const { oauthController } = await jackson();

    const { redirect_url } = await oauthController.oidcAuthzResponse(
      req.query as unknown as OIDCAuthzResponsePayload
    );
    if (redirect_url) {
      res.redirect(302, redirect_url);
    }
  } catch (err: any) {
    const message = err.message || 'Something went wrong';
    const status = err.status || 500;

    res.status(status).json({ error: { message } });
  }
}
