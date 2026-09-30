import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import { updateUser } from 'models/user';
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
  if (!session) throw new ApiError(401, 'Unauthorized');
  if ('email' in data || 'name' in data) {
    throw new ApiError(
      409,
      'Update your name and email through /auth/settings.'
    );
  }

  await updateUser({
    where: { id: session.user.id },
    data,
  });

  recordMetric('user.updated');

  res.status(204).end();
};
