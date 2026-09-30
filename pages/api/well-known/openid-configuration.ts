import type { NextApiRequest, NextApiResponse } from 'next';
import jackson from '@/lib/jackson';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: { message: 'Method not allowed' } });
    return;
  }

  const { oidcDiscoveryController } = await jackson();
  const config = oidcDiscoveryController.openidConfig();

  res.status(200).json(config);
}
