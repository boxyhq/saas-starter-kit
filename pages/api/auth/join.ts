import { hashPassword } from '@/lib/auth';
import { slugify } from '@/lib/server-common';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { isEmailAllowed } from '@/lib/email/utils';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { createTeam, getTeam, isTeamExists } from 'models/team';
import { createUser, getUser } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { getInvitation, isInvitationExpired } from 'models/invitation';
import { validateRecaptcha } from '@/lib/recaptcha';
import { slackNotify } from '@/lib/slack';
import { Team } from '@prisma/client';
import { createVerificationToken } from 'models/verificationToken';
import { userJoinSchema, validateWithSchema } from '@/lib/zod';

// TODO:
// Add zod schema validation

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
  const { name, password, team, inviteToken, recaptchaToken } = req.body;

  await validateRecaptcha(recaptchaToken);

  const invitation = inviteToken
    ? await getInvitation({ token: inviteToken })
    : null;

  let email: string = req.body.email;

  // When join via invitation
  if (invitation) {
    if (await isInvitationExpired(invitation.expires)) {
      throw new ApiError(400, 'Invitation expired. Please request a new one.');
    }

    if (invitation.sentViaEmail) {
      email = invitation.email!;
    }
  }

  validateWithSchema(userJoinSchema, {
    name,
    email,
    password,
  });

  if (!isEmailAllowed(email)) {
    throw new ApiError(
      400,
      `We currently only accept work email addresses for sign-up. Please use your work email to create an account. If you don't have a work email, feel free to contact our support team for assistance.`
    );
  }

  if (await getUser({ email })) {
    throw new ApiError(400, 'An user with this email already exists.');
  }

  // Check if team name is available
  if (!invitation) {
    if (!team) {
      throw new ApiError(400, 'A team name is required.');
    }

    const slug = slugify(team);

    validateWithSchema(userJoinSchema, { team, slug });

    const slugCollisions = await isTeamExists(slug);

    if (slugCollisions > 0) {
      throw new ApiError(400, 'A team with this slug already exists.');
    }
  }

  const user = await createUser({
    name,
    email,
    password: await hashPassword(password),
    emailVerified: invitation ? new Date() : null,
  });

  let userTeam: Team | null = null;

  // Create team if user is not invited
  // So we can create the team with the user as the owner
  if (!invitation) {
    userTeam = await createTeam({
      userId: user.id,
      name: team,
      slug: slugify(team),
    });
  } else {
    userTeam = await getTeam({ slug: invitation.team.slug });
  }

  // Send account verification email
  if (env.confirmEmail && !user.emailVerified) {
    const verificationToken = await createVerificationToken({
      identifier: user.email,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendVerificationEmail({ user, verificationToken });
  }

  recordMetric('user.signup');

  slackNotify()?.alert({
    text: invitation
      ? 'New user signed up via invitation'
      : 'New user signed up',
    fields: {
      Name: user.name,
      Email: user.email,
      Team: userTeam?.name,
    },
  });

  res.status(201).json({
    data: {
      confirmEmail: env.confirmEmail && !user.emailVerified,
    },
  });
};
