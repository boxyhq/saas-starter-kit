import jackson from '@/lib/jackson';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { directorySync } = await jackson();

  // List of directory sync providers
  res.status(200).json({ data: directorySync.providers() });
}
