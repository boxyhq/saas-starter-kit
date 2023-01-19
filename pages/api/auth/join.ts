import { hashPassword } from '@/lib/auth';
import { slugify } from '@/lib/common';
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail';
import { createTeam, isTeamExists } from 'models/team';
import { createUser, getUser } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return await handlePOST(req, res);
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
    return res.status(400).json({
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
      return res.status(400).json({
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

    await sendWelcomeEmail(name, email, team);
  }

  return res.status(201).json({ data: user });
};
