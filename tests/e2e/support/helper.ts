import { prisma } from '@/lib/prisma';

const ORY_ADMIN_URL = process.env.ORY_ADMIN_URL || 'http://localhost:4434';

export const user = {
  name: 'Jackson',
  email: 'jackson@example.com',
  password: 'Sup3rSecret-Kratos-9x',
} as const;

export const team = {
  name: 'Example',
  slug: 'example',
} as const;

export const secondTeam = {
  name: 'Ory',
  slug: 'ory',
} as const;

export async function purgeOryIdentities() {
  try {
    for (let i = 0; i < 20; i++) {
      const res = await fetch(`${ORY_ADMIN_URL}/admin/identities?per_page=500`);
      const identities: { id: string }[] = await res.json();
      if (!Array.isArray(identities) || identities.length === 0) return;
      for (const identity of identities) {
        await fetch(`${ORY_ADMIN_URL}/admin/identities/${identity.id}`, {
          method: 'DELETE',
        });
      }
    }
  } catch (error) {
    console.error('Ory identity cleanup failed:', error);
  }
}

export async function cleanup() {
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();

  await purgeOryIdentities();
}
