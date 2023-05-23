import { hashPassword } from '@/lib/auth';
import { validatePassword } from '@/lib/common';
import { prisma } from '@/lib/prisma';
import { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'method not allowed' } });
  }

  const { token, password } = req.body;

  if (!token) {
    return res.status(422).json({ error: { message: 'missing token' } });
  }

  if (!password || !validatePassword(password)) {
    return res.status(422).json({ error: { message: 'invalid password' } });
  }

  const passwordReset = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!passwordReset) {
    return res.status(422).json({
      error: { message: 'password reset token not found or expired' },
    });
  }

  if (passwordReset.expiresAt < new Date()) {
    return res
      .status(422)
      .json({ error: { message: 'password reset token has expired' } });
  }

  const hashedPassword = await hashPassword(password);

  await Promise.all([
    prisma.user.update({
      where: { email: passwordReset.email },
      data: {
        password: hashedPassword,
      },
    }),
    prisma.passwordReset.delete({
      where: { token },
    }),
  ]);

  res.status(200).json({ message: 'password updated successfully' });
};

export default handler;
