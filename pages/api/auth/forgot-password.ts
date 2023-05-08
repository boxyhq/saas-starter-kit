import { generatePasswordResetToken, validateEmail } from '@/lib/common';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        message: 'Method not allowed',
      },
    });
  }

  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(422).json({
      error: {
        message: 'Invalid email',
      },
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(422).json({
      error: {
        message: 'User not found',
      },
    });
  }

  const token = generatePasswordResetToken();
  const expirationDate = new Date(Date.now() + 60 * 60 * 1000); // expires in 1 hour
  const passwordReset = await prisma.passwordReset.create({
    data: {
      email,
      token,
      expiresAt: expirationDate,
    },
  });
  try {
    await sendPasswordResetEmail(email, token);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: {
        message: 'Failed to send password reset email',
      },
    });
  }
};

export default handler;
