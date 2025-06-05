jest.mock('models/group');
jest.mock('models/team', () => ({
  addTeamMember: jest.fn(),
  removeTeamMember: jest.fn(),
}));
jest.mock('models/user', () => ({
  deleteUser: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  upsertUser: jest.fn(),
}));
jest.mock('models/teamMember', () => ({
  countTeamMembers: jest.fn(),
}));

import { handleEvents } from '../../lib/jackson/dsyncEvents';
import * as groupModel from '../../models/group';

const createGroup = groupModel.createGroup as jest.Mock;
const updateGroup = groupModel.updateGroup as jest.Mock;
const deleteGroup = groupModel.deleteGroup as jest.Mock;

describe('Lib - dsyncEvents group handling', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should create group on group.created', async () => {
    await handleEvents({
      event: 'group.created',
      tenant: 'team1',
      data: { id: 'g1', name: 'Group', raw: { a: 1 } },
    } as any);

    expect(createGroup).toHaveBeenCalledWith({
      id: 'g1',
      name: 'Group',
      teamId: 'team1',
      raw: { a: 1 },
    });
  });

  it('should update group on group.updated', async () => {
    await handleEvents({
      event: 'group.updated',
      tenant: 'team1',
      data: { id: 'g1', name: 'New Name', raw: { b: 2 } },
    } as any);

    expect(updateGroup).toHaveBeenCalledWith({
      where: { id: 'g1' },
      data: { name: 'New Name', raw: { b: 2 } },
    });
  });

  it('should delete group on group.deleted', async () => {
    await handleEvents({
      event: 'group.deleted',
      tenant: 'team1',
      data: { id: 'g1' },
    } as any);

    expect(deleteGroup).toHaveBeenCalledWith('g1');
  });
});
