import { prisma } from '@/lib/prisma';
import { findOrCreateApp } from '@/lib/svix';
import { slackNotify } from '@/lib/slack';
import { recordMetric } from '@/lib/metrics';
import { slugify } from '@/lib/server-common';
import { maxLengthPolicies } from '@/lib/common';
import { Role, type User } from '@prisma/client';
import { getIdentityTraits, type Identity } from '@/lib/ory';
import { ApiError } from '@/lib/errors';

export class EmailVerificationRequired extends ApiError {
  constructor() {
    super(
      403,
      'Verify your email address before linking or updating this account.'
    );
  }
}

const verifiedEmail = (identity: Identity, email: string) =>
  identity.verifiable_addresses?.some(
    (address) =>
      address.verified && address.via === 'email' && address.value === email
  ) ?? false;

const normalizeName = (name?: string) =>
  name ? name.substring(0, maxLengthPolicies.name) : name;

const uniqueTeamSlug = async (base: string): Promise<string> => {
  const baseSlug = slugify(base) || 'team';
  let slug = baseSlug;
  let attempt = 0;

  while ((await prisma.team.count({ where: { slug } })) > 0) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  return slug;
};

const createDefaultTeam = async (
  userId: string,
  name: string,
  email: string
) => {
  const teamName = name?.trim() || email.split('@')[0] || 'My Team';
  const slug = await uniqueTeamSlug(teamName);

  const team = await prisma.team.create({ data: { name: teamName, slug } });

  await prisma.teamMember.create({
    data: { teamId: team.id, userId, role: Role.OWNER },
  });

  try {
    await findOrCreateApp(team.name, team.id);
  } catch (error) {
    console.error('Svix findOrCreateApp failed during provisioning:', error);
  }

  return team;
};

export const getOrCreateLocalUser = async (
  identity: Identity,
  opts?: { skipDefaultTeam?: boolean }
): Promise<User> => {
  const oryId = identity.id;
  const { email, name } = getIdentityTraits(identity);

  const linked = await prisma.user.findUnique({ where: { oryId } });
  if (linked) {
    if (email !== linked.email && !verifiedEmail(identity, email)) {
      throw new EmailVerificationRequired();
    }
    const nextName = normalizeName(name) || linked.name;
    if (email === linked.email && nextName === linked.name) return linked;
    return prisma.user.update({
      where: { id: linked.id },
      data: { email, name: nextName },
    });
  }

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.oryId) {
        throw new ApiError(
          409,
          'This account is linked to a different identity.'
        );
      }
      if (!verifiedEmail(identity, email))
        throw new EmailVerificationRequired();
      const updated = await prisma.user.updateMany({
        where: { id: existing.id, oryId: null },
        data: { oryId },
      });
      if (updated.count !== 1) {
        const current = await prisma.user.findUnique({
          where: { id: existing.id },
        });
        if (current?.oryId === oryId) return current;
        throw new ApiError(
          409,
          'Account identity changed. Please sign in again.'
        );
      }
      return { ...existing, oryId };
    }
  }

  const user = await prisma.user.create({
    data: {
      oryId,
      email,
      name: normalizeName(name) || email,
    },
  });

  if (opts?.skipDefaultTeam) {
    recordMetric('user.signup');
    return user;
  }

  const team = await createDefaultTeam(user.id, name || '', email);

  recordMetric('user.signup');
  slackNotify()?.alert({
    text: 'New user signed up',
    fields: {
      Name: user.name,
      Email: user.email,
      Team: team.name,
    },
  });

  return user;
};
