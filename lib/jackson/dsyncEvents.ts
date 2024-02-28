import { DirectorySyncEvent } from '@boxyhq/saml-jackson';
import { Role } from '@prisma/client';
import { addTeamMember, removeTeamMember } from 'models/team';
import { deleteUser, getUser, updateUser, upsertUser } from 'models/user';
import { countTeamMembers } from 'models/teamMember';

// Handle SCIM events
export const handleEvents = async (event: DirectorySyncEvent) => {
  const { event: action, tenant: teamId, data } = event;

  // Currently we only handle the user events
  // TODO: Handle group events
  if (!('email' in data)) {
    return;
  }

  const { email, first_name, last_name, active } = data;
  const name = `${first_name} ${last_name}`;

  // User has been added
  if (action === 'user.created') {
    const user = await upsertUser({
      where: {
        email,
      },
      update: {
        name,
      },
      create: {
        email,
        name,
      },
    });

    await addTeamMember(teamId, user.id, Role.MEMBER);
  }

  // User has been updated
  else if (action === 'user.updated') {
    const user = await getUser({ email });

    if (!user) {
      return;
    }

    // Deactivation of user by removing them from the team
    if (active === false) {
      await removeTeamMember(teamId, user.id);

      const otherTeamsCount = await countTeamMembers({
        where: {
          userId: user.id,
        },
      });

      if (otherTeamsCount === 0) {
        await deleteUser({ email: user.email });
      }

      return;
    }

    await updateUser({
      where: {
        email,
      },
      data: {
        name,
      },
    });

    // Reactivation of user by adding them back to the team
    await addTeamMember(teamId, user.id, Role.MEMBER);
  }

  // User has been removed
  else if (action === 'user.deleted') {
    const user = await getUser({ email });

    if (!user) {
      return;
    }

    await removeTeamMember(teamId, user.id);

    const otherTeamsCount = await countTeamMembers({
      where: {
        userId: user.id,
      },
    });

    if (otherTeamsCount === 0) {
      await deleteUser({ email: user.email });
    }
  }
};
