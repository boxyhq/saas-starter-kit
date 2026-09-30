import { Role } from '@prisma/client';
import type { Identity } from '@ory/client-fetch';

const findOrCreateApp = jest.fn();
const recordMetric = jest.fn();
const slackAlert = jest.fn();

jest.mock('lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    team: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    teamMember: { create: jest.fn(), upsert: jest.fn() },
  },
}));
jest.mock('lib/svix', () => ({
  findOrCreateApp: (...a: unknown[]) => findOrCreateApp(...a),
}));
jest.mock('lib/metrics', () => ({
  recordMetric: (...a: unknown[]) => recordMetric(...a),
}));
jest.mock('lib/slack', () => ({ slackNotify: () => ({ alert: slackAlert }) }));

import { prisma } from 'lib/prisma';
import { getOrCreateLocalUser } from 'lib/provisionUser';

// Typed handle to the mocked prisma client.
const db = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  team: { count: jest.Mock; create: jest.Mock; findUnique: jest.Mock };
  teamMember: { create: jest.Mock; upsert: jest.Mock };
};

const identity = (id: string, traits: object): Identity =>
  ({ id, traits }) as Identity;

beforeEach(() => {
  jest.clearAllMocks();
  db.team.count.mockResolvedValue(0);
});

describe('Lib - getOrCreateLocalUser', () => {
  it('returns the existing user when already linked by oryId', async () => {
    const existing = { id: 'local-1', oryId: 'ory-1', email: 'a@b.com' };
    db.user.findUnique.mockResolvedValueOnce(existing);

    const result = await getOrCreateLocalUser(
      identity('ory-1', { email: 'a@b.com' })
    );

    expect(result).toBe(existing);
    expect(db.user.create).not.toHaveBeenCalled();
    expect(db.team.create).not.toHaveBeenCalled();
  });

  it('rejects an unverified email collision without changing the existing account', async () => {
    db.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'victim',
      oryId: null,
      email: 'victim@example.com',
    });
    await expect(
      getOrCreateLocalUser(
        identity('attacker', { email: 'victim@example.com' })
      )
    ).rejects.toThrow(/Verify your email/);
    expect(db.user.updateMany).not.toHaveBeenCalled();
    expect(db.teamMember.upsert).not.toHaveBeenCalled();
  });

  const verified = (id: string, email: string): Identity => ({
    ...identity(id, { email }),
    verifiable_addresses: [
      {
        id: 'address',
        value: email,
        via: 'email',
        verified: true,
        status: 'completed',
      },
    ],
  });

  it('links a mailbox-verified legacy user conditionally', async () => {
    db.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'legacy',
      email: 'legacy@example.com',
      oryId: null,
    });
    db.user.updateMany.mockResolvedValueOnce({ count: 1 });
    const result = await getOrCreateLocalUser(
      verified('ory-2', 'legacy@example.com')
    );
    expect(db.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'legacy', oryId: null },
      data: { oryId: 'ory-2' },
    });
    expect(result.oryId).toBe('ory-2');
    expect(db.team.create).not.toHaveBeenCalled();
  });

  it('never overwrites an existing identity link even for a verified address', async () => {
    db.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'victim', oryId: 'original' });
    await expect(
      getOrCreateLocalUser(verified('attacker', 'victim@example.com'))
    ).rejects.toThrow(/different identity/);
    expect(db.user.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a concurrent identity-link conflict', async () => {
    db.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'victim', oryId: null });
    db.user.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(
      getOrCreateLocalUser(verified('attacker', 'victim@example.com'))
    ).rejects.toThrow(/identity changed/);
  });

  it('does not accept verification for a different email', async () => {
    db.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'victim', oryId: null });
    const value = verified('attacker', 'attacker@example.com');
    value.traits = { email: 'victim@example.com' };
    await expect(getOrCreateLocalUser(value)).rejects.toThrow(
      /Verify your email/
    );
  });

  it('synchronizes a verified Ory profile change for an already-linked identity', async () => {
    db.user.findUnique.mockResolvedValueOnce({
      id: 'local',
      oryId: 'ory',
      email: 'old@example.com',
      name: 'Old',
    });
    const value = verified('ory', 'new@example.com');
    value.traits.name = 'New';
    await getOrCreateLocalUser(value);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: 'local' },
      data: { email: 'new@example.com', name: 'New' },
    });
  });

  it('requires verification before synchronizing a changed email', async () => {
    db.user.findUnique.mockResolvedValueOnce({
      id: 'local',
      oryId: 'ory',
      email: 'old@example.com',
    });
    await expect(
      getOrCreateLocalUser(identity('ory', { email: 'new@example.com' }))
    ).rejects.toThrow(/Verify your email/);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('creates a new user + default OWNER team on first login', async () => {
    db.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    db.user.create.mockResolvedValueOnce({
      id: 'local-3',
      email: 'new@corp.com',
      name: 'New User',
    });
    db.team.create.mockResolvedValueOnce({ id: 'team-3', name: 'New User' });

    await getOrCreateLocalUser(
      identity('ory-3', { email: 'new@corp.com', name: 'New User' })
    );

    expect(db.user.create).toHaveBeenCalledWith({
      data: { oryId: 'ory-3', email: 'new@corp.com', name: 'New User' },
    });
    expect(db.teamMember.create).toHaveBeenCalledWith({
      data: { teamId: 'team-3', userId: 'local-3', role: Role.OWNER },
    });
    expect(findOrCreateApp).toHaveBeenCalledWith('New User', 'team-3');
    expect(recordMetric).toHaveBeenCalledWith('user.signup');
    expect(slackAlert).toHaveBeenCalled();
  });

  it('truncates an imported display name to the application limit', async () => {
    const name = 'x'.repeat(100);
    db.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    db.user.create.mockResolvedValueOnce({
      id: 'local-5',
      email: 'long@corp.com',
      name: name.slice(0, 104),
    });
    db.team.create.mockResolvedValueOnce({ id: 'team-5', name });

    await getOrCreateLocalUser(
      identity('ory-5', { email: 'long@corp.com', name })
    );

    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        oryId: 'ory-5',
        email: 'long@corp.com',
        name: name.slice(0, 104),
      },
    });
  });

  it('does not fail provisioning when the Svix webhook app call throws', async () => {
    db.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    db.user.create.mockResolvedValueOnce({
      id: 'local-4',
      email: 'x@corp.com',
      name: 'X',
    });
    db.team.create.mockResolvedValueOnce({ id: 'team-4', name: 'X' });
    findOrCreateApp.mockRejectedValueOnce(new Error('svix 401'));

    await expect(
      getOrCreateLocalUser(
        identity('ory-4', { email: 'x@corp.com', name: 'X' })
      )
    ).resolves.toMatchObject({ id: 'local-4' });
  });
});
