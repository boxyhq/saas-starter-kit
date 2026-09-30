/** @jest-environment node */
import type { Profile } from '@boxyhq/saml-jackson';
import type { Session } from '@ory/client-fetch';
import { Role } from '@prisma/client';

jest.mock('lib/env', () => ({
  __esModule: true,
  default: { jackson: { productId: 'boxyhq' }, teamFeatures: { sso: true } },
}));
jest.mock('lib/ory', () => ({ oryIdentity: { getIdentity: jest.fn() } }));
const connections = jest.fn();
jest.mock('lib/jackson/sso', () => ({
  ssoManager: () => ({ getConnections: connections }),
}));
jest.mock('lib/prisma', () => ({
  prisma: {
    verificationToken: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    team: { findUnique: jest.fn() },
    teamMember: { upsert: jest.fn() },
    $transaction: jest.fn(),
  },
}));
import { prisma } from 'lib/prisma';
import { oryIdentity } from 'lib/ory';
import { recordSSOGrant, getSSOGrant, applySSOGrant } from 'lib/ssoGrant';

const db = prisma as unknown as {
  verificationToken: {
    upsert: jest.Mock;
    findUnique: jest.Mock;
    updateMany: jest.Mock;
  };
  team: { findUnique: jest.Mock };
  teamMember: { upsert: jest.Mock };
  $transaction: jest.Mock;
};
const subject = 'team-a:boxyhq:subject';
const profile = {
  id: 'id',
  idHash: 'hash',
  firstName: 'Test',
  lastName: 'User',
  raw: {},
  sub: subject,
  email: 'user@example.com',
  requested: { tenant: 'team-a', product: 'boxyhq' },
} as Profile;
let record: { token: string; identifier: string; expires: Date } | null;
const session = (): Session =>
  ({
    identity: { id: 'ory-user', traits: { email: profile.email } },
    authentication_methods: [
      { method: 'oidc', provider: 'sso', completed_at: new Date() },
    ],
  }) as Session;

beforeEach(() => {
  jest.resetAllMocks();
  record = null;
  db.verificationToken.upsert.mockImplementation(async ({ create }) => {
    record = create;
    return record;
  });
  db.verificationToken.findUnique.mockImplementation(async ({ where }) =>
    record?.token === where.token ? { ...record } : null
  );
  db.verificationToken.updateMany.mockImplementation(
    async ({ where, data }) => {
      if (
        !record ||
        record.identifier !== where.identifier ||
        record.expires <= where.expires.gt
      )
        return { count: 0 };
      record.identifier = data.identifier;
      return { count: 1 };
    }
  );
  db.team.findUnique.mockResolvedValue({
    id: 'team-a',
    defaultRole: Role.MEMBER,
  });
  db.$transaction.mockImplementation((fn) => fn(db));
  connections.mockResolvedValue([{ deactivated: false }]);
  (oryIdentity.getIdentity as jest.Mock).mockResolvedValue({
    credentials: {
      oidc: { config: { providers: [{ provider: 'sso', subject }] } },
    },
  });
});

it('binds a verified exchange to the Ory subject and grants membership once', async () => {
  await recordSSOGrant(profile);
  const grant = await getSSOGrant(session());
  expect(grant?.team.id).toBe('team-a');
  await Promise.all([
    applySSOGrant('local-user', grant!),
    applySSOGrant('local-user', grant!),
  ]);
  expect(db.teamMember.upsert).toHaveBeenCalledTimes(1);
  expect(db.teamMember.upsert).toHaveBeenCalledWith(
    expect.objectContaining({
      create: { teamId: 'team-a', userId: 'local-user', role: Role.MEMBER },
    })
  );
  // Removing that membership must not cause session reads to recreate it.
  expect(await getSSOGrant(session())).toBeNull();
});

it('does not authorize a password login from a routing cookie or persisted metadata', async () => {
  await recordSSOGrant(profile);
  const value = session();
  value.authentication_methods = [
    { method: 'password', completed_at: new Date() },
  ];
  value.identity!.metadata_public = { sso_tenant: 'team-a' };
  expect(await getSSOGrant(value)).toBeNull();
  expect(oryIdentity.getIdentity).not.toHaveBeenCalled();
});

it.each(['team-b:boxyhq:subject', 'subject'])(
  'rejects an unrelated or unscoped Ory subject: %s',
  async (otherSubject) => {
    await recordSSOGrant(profile);
    (oryIdentity.getIdentity as jest.Mock).mockResolvedValue({
      credentials: {
        oidc: {
          config: { providers: [{ provider: 'sso', subject: otherSubject }] },
        },
      },
    });
    expect(await getSSOGrant(session())).toBeNull();
  }
);

it('does not record a grant for another product', async () => {
  await recordSSOGrant({
    ...profile,
    requested: { tenant: 'team-a', product: 'other' },
  });
  expect(record).toBeNull();
});

it('rejects stale sessions, expired grants, mismatched email, and disabled connections', async () => {
  await recordSSOGrant(profile);
  const old = session();
  old.authentication_methods![0].completed_at = new Date(Date.now() - 120_000);
  expect(await getSSOGrant(old)).toBeNull();
  const otherEmail = session();
  otherEmail.identity!.traits.email = 'other@example.com';
  expect(await getSSOGrant(otherEmail)).toBeNull();
  connections.mockResolvedValue([{ deactivated: true }]);
  expect(await getSSOGrant(session())).toBeNull();
  connections.mockResolvedValue([{ deactivated: false }]);
  record!.expires = new Date(Date.now() - 1);
  expect(await getSSOGrant(session())).toBeNull();
});
