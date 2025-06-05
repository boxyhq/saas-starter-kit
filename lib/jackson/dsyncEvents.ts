import { DirectorySyncEvent } from '@boxyhq/saml-jackson';
import { Role } from '@prisma/client';
import { addTeamMember, removeTeamMember } from 'models/team';
import { deleteUser, getUser, updateUser, upsertUser } from 'models/user';
import { countTeamMembers } from 'models/teamMember';
import { createGroup, deleteGroup, updateGroup } from 'models/group';

// Handle SCIM events
export const handleEvents = async (event: DirectorySyncEvent) => {
  const { event: action, tenant: teamId, data } = event;

  if (action.startsWith('user.')) {
    if (!('email' in data)) {
      return;
    }

    const { email, first_name, last_name, active } = data;
    const name = `${first_name} ${last_name}`;

    if (action === 'user.created') {
      const user = await upsertUser({
        where: { email },
        update: { name },
        create: { email, name },
      });

      await addTeamMember(teamId, user.id, Role.MEMBER);
    } else if (action === 'user.updated') {
      const user = await getUser({ email });
      if (!user) {
        return;
      }

      if (active === false) {
        await removeTeamMember(teamId, user.id);
        const otherTeamsCount = await countTeamMembers({
          where: { userId: user.id },
        });
        if (otherTeamsCount === 0) {
          await deleteUser({ email: user.email });
        }
        return;
      }

      await updateUser({ where: { email }, data: { name } });
      await addTeamMember(teamId, user.id, Role.MEMBER);
    } else if (action === 'user.deleted') {
      const user = await getUser({ email });
      if (!user) {
        return;
      }

      await removeTeamMember(teamId, user.id);
      const otherTeamsCount = await countTeamMembers({
        where: { userId: user.id },
      });
      if (otherTeamsCount === 0) {
        await deleteUser({ email: user.email });
      }
    }
  } else if (action === 'group.created') {
    const { id, name, raw } = data as any;
    await createGroup({ id, name, teamId, raw });
  } else if (action === 'group.updated') {
    const { id, name, raw } = data as any;
    await updateGroup({ where: { id }, data: { name, raw } });
  } else if (action === 'group.deleted') {
    const { id } = data as any;
    await deleteGroup(id);
  }
};
