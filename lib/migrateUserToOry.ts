import type { IdentityPatch } from '@ory/client-fetch';

export type MigratableUser = {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  emailVerified: Date | null;
};

export const buildIdentityPatch = (user: MigratableUser): IdentityPatch => {
  const create: IdentityPatch['create'] = {
    schema_id: 'default',
    state: 'active',
    traits: {
      email: user.email,
      ...(user.name ? { name: user.name } : {}),
    },
  };

  if (user.emailVerified) {
    create!.verifiable_addresses = [
      {
        value: user.email,
        verified: true,
        via: 'email',
        status: 'completed',
      },
    ];
  }

  if (user.password) {
    create!.credentials = {
      password: {
        config: {
          hashed_password: user.password,
        },
      },
    };
  }

  return {
    patch_id: user.id,
    create,
  };
};

export const chunk = <T>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};
