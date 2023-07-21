import { hashPassword } from '@/lib/auth';
import { slugify } from '@/lib/common';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import env from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { createTeam, isTeamExists } from 'models/team';
import { createUser, getUser } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      await handlePOST(req, res);
      break;
    default:
      res.setHeader('Allow', 'POST');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Signup the user
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, password, team } = req.body;

  const existingUser = await getUser({ email });

  if (existingUser) {
    res.status(400).json({
      error: {
        message:
          'An user with this email already exists or the email was invalid.',
      },
    });
  }

  // Create a new team
  if (team) {
    const slug = slugify(team);

    const nameCollisions = await isTeamExists([{ name: team }, { slug }]);

    if (nameCollisions > 0) {
      res.status(400).json({
        error: {
          message: 'A team with this name already exists in our database.',
        },
      });
    }
  }

  const user = await createUser({
    name,
    email,
    password: await hashPassword(password),
  });

  if (team) {
    const slug = slugify(team);

    await createTeam({
      userId: user.id,
      name: team,
      slug,
    });
  }

  // Send account verification email
  if (user && env.confirmEmail) {
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: uuidv4(),
        expires: new Date(),
      },
    });

    await sendVerificationEmail({ user, verificationToken });
  }

  res.status(201).json({ data: user });
};
