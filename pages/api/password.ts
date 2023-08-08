import { hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';

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
  const session = await getSession(req, res);

  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const user = await prisma.user.findFirstOrThrow({
    where: { id: session?.user.id },
  });

  if (!(await verifyPassword(currentPassword, user.password as string))) {
    throw new ApiError(400, 'Your current password is incorrect');
  }

  await prisma.user.update({
    where: { id: session?.user.id },
    data: { password: await hashPassword(newPassword) },
  });

  res.status(200).json({ data: user });
};
