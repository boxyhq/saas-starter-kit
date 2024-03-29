import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';
import { getUser, updateUser } from 'models/user';
import { isEmailAllowed } from '@/lib/email/utils';
import { updateAccountSchema, validateWithSchema } from '@/lib/zod';

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
  const data = validateWithSchema(updateAccountSchema, req.body);

  const session = await getSession(req, res);

  if ('email' in data) {
    const allowEmailChange = env.confirmEmail === false;

    if (!allowEmailChange) {
      throw new ApiError(400, 'Email change is not allowed.');
    }

    if (!isEmailAllowed(data.email)) {
      throw new ApiError(400, 'Please use your work email.');
    }

    const user = await getUser({ email: data.email });

    if (user && user.id !== session?.user.id) {
      throw new ApiError(400, 'Email already in use.');
    }
  }

  await updateUser({
    where: { id: session?.user.id },
    data,
  });

  recordMetric('user.updated');

  res.status(204).end();
};
