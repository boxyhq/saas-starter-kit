import { Role } from '@prisma/client';
jest.mock('lib/session', () => ({ getSession: jest.fn() }));
import { throwIfNotAllowed } from 'models/user';

describe('RBAC - throwIfNotAllowed (unchanged by the Ory migration)', () => {
  it('lets OWNER manage payments', () => {
    expect(
      throwIfNotAllowed({ role: Role.OWNER }, 'team_payments', 'update')
    ).toBe(true);
  });

  it('lets ADMIN manage members', () => {
    expect(
      throwIfNotAllowed({ role: Role.ADMIN }, 'team_member', 'delete')
    ).toBe(true);
  });

  it('allows MEMBER to read and leave a team', () => {
    expect(throwIfNotAllowed({ role: Role.MEMBER }, 'team', 'read')).toBe(true);
    expect(throwIfNotAllowed({ role: Role.MEMBER }, 'team', 'leave')).toBe(
      true
    );
  });

  it('blocks MEMBER from privileged actions', () => {
    expect(() =>
      throwIfNotAllowed({ role: Role.MEMBER }, 'team_api_key', 'create')
    ).toThrow(/not allowed/);
    expect(() =>
      throwIfNotAllowed({ role: Role.MEMBER }, 'team', 'delete')
    ).toThrow(/not allowed/);
  });
});
