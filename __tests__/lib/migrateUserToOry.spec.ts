import { buildIdentityPatch, chunk } from '@/lib/migrateUserToOry';

describe('Lib - migrateUserToOry', () => {
  const base = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    name: 'Jane Doe',
    password: '$2a$12$abcdefghijklmnopqrstuv',
    emailVerified: new Date('2024-01-01T00:00:00Z'),
  };

  it('uses the local user id as patch_id for write-back correlation', () => {
    expect(buildIdentityPatch(base).patch_id).toBe(base.id);
  });

  it('maps email and name into traits with the default schema', () => {
    const patch = buildIdentityPatch(base);
    expect(patch.create?.schema_id).toBe('default');
    expect(patch.create?.state).toBe('active');
    expect(patch.create?.traits).toEqual({
      email: 'user@example.com',
      name: 'Jane Doe',
    });
  });

  it('passes the bcrypt hash through as hashed_password (no reset)', () => {
    const patch = buildIdentityPatch(base);
    expect(patch.create?.credentials?.password?.config?.hashed_password).toBe(
      base.password
    );
  });

  it('marks the email verified when emailVerified is set', () => {
    const patch = buildIdentityPatch(base);
    expect(patch.create?.verifiable_addresses).toEqual([
      { value: base.email, verified: true, via: 'email', status: 'completed' },
    ]);
  });

  it('omits password credential for social-only / passwordless users', () => {
    const patch = buildIdentityPatch({ ...base, password: null });
    expect(patch.create?.credentials).toBeUndefined();
  });

  it('omits verifiable_addresses for unverified users and omits empty name', () => {
    const patch = buildIdentityPatch({
      ...base,
      emailVerified: null,
      name: null,
    });
    expect(patch.create?.verifiable_addresses).toBeUndefined();
    expect(patch.create?.traits).toEqual({ email: base.email });
  });

  it('chunks batches to guard against import timeouts', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 100)).toEqual([]);
  });
});
