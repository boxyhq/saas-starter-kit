import { Role } from '@prisma/client';
jest.mock('models/team', () => ({ getTeamMember: jest.fn() }));
import { getTeamMember } from 'models/team';
import { validateMembershipOperation } from 'lib/rbac';

const owner = { userId: 'owner', role: Role.OWNER, team: { slug: 'acme' } };
it('rejects owner self-removal and self-demotion at the server boundary', async () => {
  await expect(
    validateMembershipOperation('owner', owner)
  ).rejects.toMatchObject({ status: 403 });
  await expect(
    validateMembershipOperation('owner', owner, { role: Role.MEMBER })
  ).rejects.toMatchObject({ status: 403 });
});
it('continues allowing an owner to manage another member', async () => {
  (getTeamMember as jest.Mock).mockResolvedValue({ role: Role.MEMBER });
  await expect(
    validateMembershipOperation('member', owner, { role: Role.ADMIN })
  ).resolves.toBeUndefined();
});
