const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jackson = require('@boxyhq/saml-jackson');
const product = process.env.JACKSON_PRODUCT_ID || 'boxyhq';

const opts = {
  externalUrl: `${process.env.APP_URL}`,
  samlPath: '/api/oauth/saml',
  oidcPath: '/api/oauth/oidc',
  samlAudience: 'https://saml.boxyhq.com',
  db: {
    engine: 'sql',
    type: 'postgres',
    url: `${process.env.DATABASE_URL}`,
  },
  idpDiscoveryPath: '/auth/sso/idp-select',
  idpEnabled: true,
  openid: {},
};

const options = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.JACKSON_API_KEY}`,
  },
};

const useHostedJackson = process.env.JACKSON_URL ? true : false;

let jacksonInstance;

init();

async function init() {
  if (process.argv.length < 3) {
    console.log(
      `Usage: 
        node delete-team.js <teamId> [teamId]
        npm run delete-team -- <teamId> [teamId]`
    );
    console.log(
      `Example: 
        node delete-team.js 01850e43-d1e0-4b92-abe5-271b159ff99b
        npm run delete-team -- 01850e43-d1e0-4b92-abe5-271b159ff99b`
    );
    process.exit(1);
  } else {
    if (!useHostedJackson) {
      console.log('Using embedded Jackson');
      jacksonInstance = await jackson.default(opts);
    }
    for (let i = 2; i < process.argv.length; i++) {
      const teamId = process.argv[i];
      try {
        await handleTeamDeletion(teamId);
      } catch (error) {
        console.log('Error deleting team:', error?.message);
      }
    }
    console.log('\nDone deleting teams');
    await prisma.$disconnect();
    console.log('Disconnected from database');
    process.exit(0);
  }
}

async function handleTeamDeletion(teamId) {
  console.log(`Checking team: ${teamId}`);
  let team = await getTeamById(teamId);
  if (!team) {
    console.log(`Team not found: ${teamId}`);
    return;
  } else {
    console.log('Team found:', team.name);
    if (team?.billingId) {
      console.log('Checking active team subscriptions');
      const activeSubscriptions = await getActiveSubscriptions(team);
      if (activeSubscriptions.length > 0) {
        console.log(
          `${activeSubscriptions.length} Active subscriptions found. Please cancel them before deleting the team.`
        );
        console.table(activeSubscriptions);
        return;
      } else {
        console.log('No active subscriptions found');
      }
    }
    await removeDSyncConnections(team);
    await removeSSOConnections(team);
    await removeTeamSubscriptions(team);
    await removeTeamMembers(team);
    await removeTeam(team);
  }
}

async function getTeamById(teamId) {
  return await prisma.team.findUnique({
    where: {
      id: teamId,
    },
  });
}

async function removeTeam(team) {
  console.log('\nDeleting team:', team.id);
  await prisma.team.delete({
    where: {
      id: team.id,
    },
  });
  console.log('Team deleted:', team.name);
}

async function removeSSOConnections(team) {
  console.log(`\nRemoving team SSO connections`);

  const params = {
    tenant: team.id,
    product,
  };
  if (useHostedJackson) {
    const ssoUrl = `${process.env.JACKSON_URL}/api/v1/sso`;
    const query = new URLSearchParams(params);

    const response = await fetch(`${ssoUrl}?${query}`, {
      ...options,
      method: 'DELETE',
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error.message);
    }
  } else {
    const { apiController } = jacksonInstance;

    await apiController.deleteConnections(params);
  }
  console.log(`Done removing team SSO connections`);
}

async function removeDSyncConnections(team) {
  console.log(`\Checking team DSync connections`);
  const connections = await getConnections(team.id);
  console.log(`Found ${connections.length} DSync connections`);
  for (const connection of connections) {
    console.log('\nDeleting connection:', connection.id);
    await deleteConnection(connection.id);
    console.log('Connection deleted:', connection.id);
  }
  console.log(`\nDone removing team DSync connections`);
}

async function removeTeamSubscriptions(team) {
  console.log('\nDeleting team subscriptions');
  if (team?.billingId) {
    await prisma.subscription.deleteMany({
      where: {
        customerId: team?.billingId,
      },
    });
  }
  console.log('Team subscriptions deleted');
}

async function getActiveSubscriptions(team) {
  return await prisma.subscription.findMany({
    where: {
      customerId: team?.billingId,
      active: true,
      endDate: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      customerId: true,
      startDate: true,
      endDate: true,
      priceId: true,
    },
  });
}

async function removeTeamMembers(team) {
  console.log('\nChecking team members');

  const teamMembers = await prisma.user.findMany({
    where: {
      teamMembers: {
        some: {
          teamId: team.id,
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
  console.log(`Found ${teamMembers.length} team members`);
  console.table(teamMembers);

  for (const user of teamMembers) {
    await checkAndRemoveUser(user, team);
  }
}

async function checkAndRemoveUser(user, team) {
  console.log('\nChecking user:', user.id);
  const userTeams = await prisma.teamMember.findMany({
    where: {
      userId: user.id,
    },
  });
  console.log(`User belongs to ${userTeams.length} teams`);
  if (userTeams.length === 1) {
    console.log('Deleting user:', user.email);
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    console.log('User deleted:', user.email);
  } else {
    console.log('Removing user from team:', team.name);
    await prisma.teamMember.deleteMany({
      where: {
        userId: user.id,
        teamId: team.id,
      },
    });
    console.log('User removed from team:', team.name);
  }
}

async function getConnections(tenant) {
  if (useHostedJackson) {
    const searchParams = new URLSearchParams({
      tenant: tenant,
      product,
    });

    const response = await fetch(
      `${process.env.JACKSON_URL}/api/v1/dsync?${searchParams}`,
      {
        ...options,
      }
    );

    const { data, error } = await response.json();

    if (!response.ok) {
      throw new Error(error.message);
    }

    return data;
  } else {
    const { directorySyncController } = jacksonInstance;

    const { data, error } =
      await directorySyncController.directories.getByTenantAndProduct(
        tenant,
        product
      );

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

async function deleteConnection(directoryId) {
  if (useHostedJackson) {
    const response = await fetch(
      `${process.env.JACKSON_URL}/api/v1/dsync/${directoryId}`,
      {
        ...options,
        method: 'DELETE',
      }
    );

    const { data, error } = await response.json();

    if (!response.ok) {
      throw new Error(error.message);
    }

    return { data };
  } else {
    const { directorySyncController } = jacksonInstance;

    const { data, error } =
      await directorySyncController.directories.delete(directoryId);

    if (error) {
      throw new Error(error.message);
    }

    return { data };
  }
}

// handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
