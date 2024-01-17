import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';
import { getUser } from 'models/user';
import { isEmailAllowed } from '@/lib/email/utils';
import { updateAccountSchema } from '@/lib/zod/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'PUT':
        await handlePUT(req, res);
        break;
      default:
        res.setHeader('Allow', 'PUT');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = updateAccountSchema.parse(req.body);

  const session = await getSession(req, res);
  const toUpdate = {};

  if ('name' in body) {
    toUpdate['name'] = body.name;
  }

  if ('email' in body) {
    const allowEmailChange = env.confirmEmail === false;

    if (!allowEmailChange) {
      throw new ApiError(400, 'Email change is not allowed.');
    }

    if (!isEmailAllowed(body.email)) {
      throw new ApiError(400, 'Please use your work email.');
    }

    const user = await getUser({ email: body.email });

    if (user && user.id !== session?.user.id) {
      throw new ApiError(400, 'Email already in use.');
    }

    toUpdate['email'] = body.email;
  }

  if ('image' in body) {
    toUpdate['image'] = body.image;
  }

  if (Object.keys(toUpdate).length === 0) {
    throw new ApiError(400, 'Invalid request');
  }

  await prisma.user.update({
    where: { id: session?.user.id },
    data: toUpdate,
  });

  recordMetric('user.updated');

  res.status(204).end();
};
