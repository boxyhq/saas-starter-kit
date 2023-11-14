import type { NextApiRequest, NextApiResponse } from 'next';

import { handleSCIMEvents } from '@/lib/jackson/dsync';
import { ApiError } from '@/lib/errors';

// TODO: Verify the request signature
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method != 'POST') {
      throw new ApiError(400, `Method ${req.method} Not Allowed`);
    }

    await handleSCIMEvents(req.body);

    res.end();
  } catch (error: any) {
    console.error(error);
    res.end();
  }
}
