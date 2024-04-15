const { PrismaClient } = require('@prisma/client');

const init = async () => {
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
    const prisma = new PrismaClient();
    for (let i = 2; i < process.argv.length; i++) {
      const teamId = process.argv[i];
      try {
        console.log('Checking team:', teamId);
        const teamExists = await prisma.team.findUnique({
          where: {
            id: teamId,
          },
        });
        if (!teamExists) {
          console.log('Team not found:', teamId);
          continue;
        }
        console.log('Deleting team:', teamId);
        const team = await prisma.team.delete({
          where: {
            id: teamId,
          },
        });
        console.log('Team deleted:', team.name);
        console.log('Deleting team members');
        await prisma.user.deleteMany({
          where: {
            teamMembers: {
              none: {},
            },
          },
        });
        console.log('Team members deleted');
        if (team?.billingId) {
          console.log('Deleting team subscriptions');
          await prisma.subscription.deleteMany({
            where: {
              customerId: team?.billingId,
            },
          });
          console.log('Team subscriptions deleted');
        }
      } catch (error) {
        console.log('Error deleting team:', error?.message);
      }
    }
    await prisma.$disconnect();
  }
};

init();

// handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
