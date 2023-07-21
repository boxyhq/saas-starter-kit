import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      await handleGET(req, res);
      break;
    default:
      res.setHeader('Allow', 'GET');
      res.status(405).send({ message: `Method ${req.method} Not Allowed` });
  }
}

// Verify the email verification token
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query as { token: string };

  if (!token) {
    res.redirect(307, '/auth/login');
    return;
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    res.redirect(307, '/auth/login');
    return;
  }

  await Promise.allSettled([
    prisma.user.update({
      where: {
        email: verificationToken?.identifier,
      },
      data: {
        emailVerified: new Date(),
      },
    }),

    prisma.verificationToken.delete({
      where: {
        token,
      },
    }),
  ]);

  res.redirect(307, '/auth/login');
};
