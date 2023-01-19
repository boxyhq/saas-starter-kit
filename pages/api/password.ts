import { hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'PUT':
      return await handlePUT(req, res);
    default:
      res.setHeader('Allow', 'PUT');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const user = await prisma.user.findFirstOrThrow({
    where: { id: session.user.id },
  });

  if (!(await verifyPassword(currentPassword, user.password))) {
    return res
      .status(400)
      .json({ error: { message: 'Your current password is incorrect' } });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: await hashPassword(newPassword) },
  });

  return res.status(200).json({ data: user });
};
