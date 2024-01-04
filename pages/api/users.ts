import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';
import { getUser } from 'models/user';
import { isEmailAllowed } from '@/lib/email/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'PUT':
        await handlePUT(req, res);
        break;
      default:
        res.setHeader('Allow', 'PUT');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const allowEmailChange = env.confirmEmail === false;
  const session = await getSession(req, res);
  const toUpdate = {};

  if ('name' in req.body && req.body.name) {
    toUpdate['name'] = req.body.name;
  }

  // Only allow email change if confirmEmail is false
  if ('email' in req.body && req.body.email && allowEmailChange) {
    const { email } = req.body;

    if (!isEmailAllowed(email)) {
      throw new ApiError(400, 'Please use your work email.');
    }

    const user = await getUser({ email });

    if (user && user.id !== session?.user.id) {
      throw new ApiError(400, 'Email already in use.');
    }

    toUpdate['email'] = email;
  }

  if ('image' in req.body) {
    toUpdate['image'] = req.body.image;
  }

  if (Object.keys(toUpdate).length === 0) {
    throw new ApiError(400, 'Invalid request');
  }

  await prisma.user.update({
    where: { id: session?.user.id },
    data: toUpdate,
  });

  recordMetric('user.updated');

  res.status(200).json({ data: {} });
};
