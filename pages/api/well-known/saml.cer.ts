import type { NextApiRequest, NextApiResponse } from 'next';
import jackson from '@/lib/jackson';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    throw { message: 'Method not allowed', statusCode: 405 };
  }

  const { spConfig } = await jackson();
  const config = await spConfig.get();

  res
    .status(200)
    .setHeader('Content-Type', 'application/x-x509-ca-cert')
    .send(config.publicKey);
}
