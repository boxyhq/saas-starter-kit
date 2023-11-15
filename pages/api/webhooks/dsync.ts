import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { handleEvents } from '@/lib/jackson/dsyncEvents';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method != 'POST') {
      throw new ApiError(400, `Method ${req.method} Not Allowed`);
    }

    if (!verifyWebhookSignature(req)) {
      console.error('Signature verification failed.');
      res.end();
      return;
    }

    await handleEvents(req.body);

    res.end();
  } catch (error: any) {
    console.error(error);
    res.end();
  }
}

const verifyWebhookSignature = (req: NextApiRequest) => {
  const signatureHeader = req.headers['boxyhq-signature'] as string;

  if (!signatureHeader) {
    return false;
  }

  const [t, s] = signatureHeader.split(',');
  const timestamp = parseInt(t.split('=')[1]);
  const signature = s.split('=')[1];

  const expectedSignature = crypto
    .createHmac('sha256', env.jackson.dsync.webhook_secret as string)
    .update(`${timestamp}.${JSON.stringify(req.body)}`)
    .digest('hex');

  return signature === expectedSignature;
};
