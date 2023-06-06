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
  const { name, image } = req.body;

  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }
  console.log(name, image);
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, image },
  });

  return res.status(200).json({ data: user });
};
