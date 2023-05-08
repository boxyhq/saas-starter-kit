import { hashPassword } from '@/lib/auth';
import { validatePassword } from '@/lib/common';
import { prisma } from '@/lib/prisma';
import { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const { token, password } = req.body;

  if (!token) {
    return res.status(422).json({ error: { message: 'Missing token' } });
  }

  if (!password || !validatePassword(password)) {
    return res.status(422).json({ error: { message: 'Invalid password' } });
  }

  const passwordReset = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!passwordReset) {
    return res
      .status(422)
      .json({
        error: { message: 'Password reset token not found or expired' },
      });
  }

  if (passwordReset.expiresAt < new Date()) {
    return res
      .status(422)
      .json({ error: { message: 'Password reset token has expired' } });
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

  res.status(200).json({ message: 'Password updated successfully' });
};

export default handler;
