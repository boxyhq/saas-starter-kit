import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

const deleteSessionSchema = z.object({
  id: z.string(),
});

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
  const params = deleteSessionSchema.parse(req.query);
  const session = await getSession(req, res);

  await prisma.session.findFirstOrThrow({
    where: {
      id: params.id,
      userId: session?.user.id,
    },
  });

  await prisma.session.delete({
    where: {
      id: params.id,
    },
  });

  res.status(204).end();
};
