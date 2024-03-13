import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { deleteSession, findFirstSessionOrThrown } from 'models/session';
import { ApiError } from '@/lib/errors';
import { deleteSessionSchema } from '@/lib/zod/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'DELETE');
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

// Delete a session for the current user
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const result = deleteSessionSchema.safeParse(req.query);

  if (!result.success) {
    throw new ApiError(
      422,
      `Validation Error: ${result.error.errors.map((e) => e.message)[0]}`
    );
  }

  const session = await getSession(req, res);

  await findFirstSessionOrThrown({
    where: {
      id,
      userId: session?.user.id,
    },
  });

  await deleteSession({
    where: {
      id,
    },
  });

  res.status(204).end();
};
