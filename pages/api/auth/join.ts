import { hashPassword, validatePasswordPolicy } from '@/lib/auth';
import { generateToken, slugify } from '@/lib/common';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { prisma } from '@/lib/prisma';
import { isBusinessEmail } from '@/lib/email/utils';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { createTeam, isTeamExists } from 'models/team';
import { createUser, getUser } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { validateRecaptcha } from '@/lib/recaptcha';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
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
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Signup the user
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, password, team, recaptchaToken } = req.body;

  await validateRecaptcha(recaptchaToken);

  const existingUser = await getUser({ email });

  if (existingUser) {
    throw new ApiError(400, 'An user with this email already exists.');
  }

  validatePasswordPolicy(password);

  if (env.disableNonBusinessEmailSignup && !isBusinessEmail(email)) {
    throw new ApiError(
      400,
      `We currently only accept work email addresses for sign-up. Please use your work email to create an account. If you don't have a work email, feel free to contact our support team for assistance.`
    );
  }

  // Create a new team
  if (team) {
    const slug = slugify(team);

    const nameCollisions = await isTeamExists([{ name: team }, { slug }]);

    if (nameCollisions > 0) {
      throw new ApiError(400, 'A team with this name already exists.');
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
  if (env.confirmEmail) {
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: generateToken(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      },
    });

    await sendVerificationEmail({ user, verificationToken });
  }

  recordMetric('user.signup');

  res.status(201).json({
    data: {
      user,
      confirmEmail: env.confirmEmail,
    },
  });
};
