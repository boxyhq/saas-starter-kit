import { generatePasswordResetToken, validateEmail } from '@/lib/common';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';
import { prisma } from '@/lib/prisma';
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
        message: `The e-mail address you entered is invalid`,
      },
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(422).json({
      error: {
        message: `We can't find a user with that e-mail address`,
      },
    });
  }

  const token = generatePasswordResetToken();
  const expirationDate = new Date(Date.now() + 60 * 60 * 1000); // expires in 1 hour
  await prisma.passwordReset.create({
    data: {
      email,
      token,
      expiresAt: expirationDate,
    },
  });

  try {
    await sendPasswordResetEmail(email, encodeURIComponent(token));

    res.status(200).json({ message: `Password reset e-mail sent` });
  } catch (err) {
    res.status(500).json({
      error: {
        message: `Error sending password reset e-mail. Please try again later.`,
      },
    });
  }
};

export default handler;
