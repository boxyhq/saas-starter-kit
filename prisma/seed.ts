const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();
const { hash } = require('bcryptjs');
const { randomUUID } = require('crypto');

const USER_COUNT = 100;
const TEAM_COUNT = 5;

async function seedUsers() {
  const newUsers: any[] = [];
  await createRandomUser('admin@example.com', 'admin@123');
  await createRandomUser('user@example.com', 'user@123');
  await Promise.all(
    Array(USER_COUNT)
      .fill(0)
      .map(async () => {
        await createRandomUser();
      })
  );

  console.log('Seeded users', newUsers.length);

  return newUsers;

  async function createRandomUser(
    email: string | undefined = undefined,
    password: string | undefined = undefined
  ) {
    try {
      const originalPassword = password || faker.internet.password();
      email = email || faker.internet.email();
      password = await hash(originalPassword, 12);
      const user = await client.user.create({
        data: {
          email,
          name: faker.person.firstName(),
          password,
          emailVerified: new Date(),
        },
      });
      newUsers.push({
        ...user,
        password: originalPassword,
      });
    } catch (ex) {
      console.log(ex);
    }
  }
}

async function seedTeams() {
  const newTeams: any[] = [];

  await Promise.all(
    Array(TEAM_COUNT)
      .fill(0)
      .map(async () => {
        const name = faker.company.name();
        const team = await client.team.create({
          data: {
            name,
            slug: name.toLowerCase().split(' ').join('-'),
          },
        });
        newTeams.push(team);
      })
  );

  console.log('Seeded teams', newTeams.length);

  return newTeams;
}

async function seedTeamMembers(users: any[], teams: any[]) {
  const newTeamMembers: any[] = [];
  const roles = ['OWNER', 'MEMBER'];
  for (let i = 0; i < users.length; i++) {
    const user: any = users[i];
    let count = Math.floor(Math.random() * TEAM_COUNT) + 2;
    count = count > TEAM_COUNT ? TEAM_COUNT : count;
    const teamUsed: string[] = [];
    for (let j = 0; j < count; j++) {
      try {
        const teamId = teams[Math.floor(Math.random() * TEAM_COUNT)].id;
        if (teamUsed.includes(teamId)) {
          j--;
          continue;
        } else {
          teamUsed.push(teamId);
        }
        teamUsed.push(teamId);
        const allocation = +(await client.teamMember.create({
          data: {
            role: user.email.includes('admin')
              ? 'OWNER'
              : user.email.includes('user')
                ? 'MEMBER'
                : roles[Math.floor(Math.random() * 2)],
            teamId,
            userId: user.id,
          },
        }));
        newTeamMembers.push(allocation);
      } catch (ex) {
        console.log(ex);
        j--;
      }
    }
  }

  console.log('Seeded team members', newTeamMembers.length);

  return newTeamMembers;
}

async function seedInvitations(teams: any[], users: any[]) {
  const newInvitations: any[] = [];
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const count = Math.floor(Math.random() * USER_COUNT) + 2;
    for (let j = 0; j < count; j++) {
      try {
        const invitation = await client.invitation.create({
          data: {
            teamId: team.id,
            invitedBy: users[Math.floor(Math.random() * USER_COUNT)].id,
            email: faker.internet.email(),
            role: 'MEMBER',
            sentViaEmail: true,
            token: randomUUID(),
            allowedDomains: [],
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
        newInvitations.push(invitation);
      } catch (ex) {
        console.log(ex);
        j--;
      }
    }
  }

  console.log('Seeded invitations', newInvitations.length);

  return newInvitations;
}

async function init() {
  const users = await seedUsers();
  const teams = await seedTeams();
  await seedTeamMembers(users, teams);
  await seedInvitations(teams, users);
}

init();
