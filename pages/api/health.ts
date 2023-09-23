import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

import packageInfo from '../../package.json';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }

    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      version: packageInfo.version,
    });
  } catch (err: any) {
    const { statusCode = 503 } = err;
    res.status(statusCode).json({});
  }
}
