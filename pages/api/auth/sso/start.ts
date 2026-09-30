import env from '@/lib/env';
import { ssoManager } from '@/lib/jackson/sso';
import { tenantCookie } from '@/lib/sso';
import type { NextApiRequest, NextApiResponse } from 'next';

const sso = ssoManager();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: { message: 'Method Not Allowed' } });
    return;
  }

  try {
    const { teamId } = req.body as { teamId?: string };

    if (!teamId) {
      throw new Error('teamId is required');
    }

    const connections = await sso.getConnections({
      tenant: teamId,
      product: env.jackson.productId,
    });

    if (!connections || connections.length === 0) {
      throw new Error('No SSO connections found for this team.');
    }

    res.setHeader('Set-Cookie', [tenantCookie(teamId)]);

    res.status(200).json({ data: { ok: true } });
  } catch (err: any) {
    res.status(400).json({ error: { message: err.message } });
  }
}
