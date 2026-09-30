import { faker } from '@faker-js/faker';
import { PrismaClient, Role } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { randomUUID } from 'crypto';

import { oryIdentity } from '../lib/ory';
import { buildIdentityPatch } from '../lib/migrateUserToOry';

const prisma = new PrismaClient();

const DEMO_TEAM = { name: 'Demo', slug: 'demo' };
const DEMO_PASSWORD = 'Demo-Member-Passw0rd';

const DEMO_USERS = [
  {
    email: 'admin@example.com',
    name: 'Demo Admin',
    password: 'Demo-Admin-Passw0rd',
    role: Role.OWNER,
  },
  {
    email: 'user@example.com',
    name: 'Demo Member',
    password: DEMO_PASSWORD,
    role: Role.MEMBER,
  },
];

async function ensureOryIdentity(
  email: string,
  name: string,
  password: string
) {
  const existing = await oryIdentity.listIdentities({
    credentialsIdentifier: email,
  });
  if (existing.length > 0) {
    return existing[0].id;
  }

  const patch = buildIdentityPatch({
    id: randomUUID(),
    email,
    name,
    password: hashSync(password, 12),
    emailVerified: new Date(),
  });

  const res = await oryIdentity.batchPatchIdentities({
    patchIdentitiesBody: { identities: [patch] },
  });
  const result = res.identities?.[0];
  if (!result || result.action === 'error' || !result.identity) {
    throw new Error(
      `Failed to import identity ${email}: ${JSON.stringify(result?.error)}`
    );
  }
  return result.identity;
}

async function ensureLocalUser(oryId: string, email: string, name: string) {
  return prisma.user.upsert({
    where: { email },
    update: { oryId },
    create: { oryId, email, name },
  });
}

async function ensureMembership(teamId: string, userId: string, role: Role) {
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId, userId } },
    update: { role },
    create: { teamId, userId, role },
  });
}

async function seedMember(
  email: string,
  name: string,
  password: string,
  role: Role,
  teamId: string
) {
  const oryId = await ensureOryIdentity(email, name, password);
  const user = await ensureLocalUser(oryId, email, name);
  await ensureMembership(teamId, user.id, role);
  return user;
}

async function main() {
  const team =
    (await prisma.team.findUnique({ where: { slug: DEMO_TEAM.slug } })) ??
    (await prisma.team.create({ data: DEMO_TEAM }));

  const owner = await seedMember(
    DEMO_USERS[0].email,
    DEMO_USERS[0].name,
    DEMO_USERS[0].password,
    DEMO_USERS[0].role,
    team.id
  );
  for (const u of DEMO_USERS.slice(1)) {
    await seedMember(u.email, u.name, u.password, u.role, team.id);
  }
  for (let i = 0; i < 3; i++) {
    const name = faker.person.fullName();
    const email = faker.internet
      .email({ firstName: name.split(' ')[0] })
      .toLowerCase();
    await seedMember(email, name, DEMO_PASSWORD, Role.MEMBER, team.id);
  }

  for (let i = 0; i < 2; i++) {
    const email = faker.internet.email().toLowerCase();
    await prisma.invitation.upsert({
      where: { teamId_email: { teamId: team.id, email } },
      update: {},
      create: {
        teamId: team.id,
        invitedBy: owner.id,
        email,
        role: Role.MEMBER,
        sentViaEmail: true,
        token: randomUUID(),
        allowedDomains: [],
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`Seeded team "${team.name}" with demo members and invitations.`);
  console.log('Demo logins:');
  console.log('  admin@example.com / Demo-Admin-Passw0rd  (OWNER)');
  console.log('  user@example.com  / Demo-Member-Passw0rd (MEMBER)');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
