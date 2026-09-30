import { PrismaClient } from '@prisma/client';
import { Configuration, IdentityApi } from '@ory/client-fetch';

import { buildIdentityPatch, chunk } from '../lib/migrateUserToOry';

const prisma = new PrismaClient();

const identityApi = new IdentityApi(
  new Configuration({
    basePath: process.env.ORY_ADMIN_URL || 'http://localhost:4434',
    ...(process.env.ORY_API_KEY
      ? { accessToken: process.env.ORY_API_KEY }
      : {}),
  })
);

const BATCH_SIZE = 100;

async function main() {
  const users = await prisma.user.findMany({
    where: { oryId: null },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      emailVerified: true,
    },
  });

  if (users.length === 0) {
    console.log('No users to migrate (all already linked to Ory).');
    return;
  }

  console.log(`Migrating ${users.length} user(s) in batches of ${BATCH_SIZE}…`);

  let imported = 0;
  let failed = 0;

  for (const batch of chunk(users, BATCH_SIZE)) {
    const identities = batch.map(buildIdentityPatch);

    const response = await identityApi.batchPatchIdentities({
      patchIdentitiesBody: { identities },
    });

    for (const result of response.identities ?? []) {
      const userId = result.patch_id;

      if (result.action === 'error' || !result.identity || !userId) {
        failed += 1;
        console.error(
          `  ✗ user ${userId}: ${JSON.stringify(result.error ?? 'unknown error')}`
        );
        continue;
      }

      await prisma.user.update({
        where: { id: userId },
        data: { oryId: result.identity },
      });
      imported += 1;
    }
  }

  console.log(`Done. Imported ${imported}, failed ${failed}.`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
