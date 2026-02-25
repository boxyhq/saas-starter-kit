const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();
const { hash } = require('bcryptjs');
const { randomUUID } = require('crypto');

let USER_COUNT = 10;
const TEAM_COUNT = 5;
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin@123';
const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'user@123';
async function seedUsers() {
  const newUsers: any[] = [];
  await createRandomUser(ADMIN_EMAIL, ADMIN_PASSWORD);
  await createRandomUser(USER_EMAIL, USER_PASSWORD);
  await Promise.all(
    Array(USER_COUNT)
      .fill(0)
      .map(() => createRandomUser())
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
      USER_COUNT--;
    } catch (ex: any) {
      if (ex.message.indexOf('Unique constraint failed') > -1) {
        console.error('Duplicate email', email);
      } else {
        console.log(ex);
      }
    }
  }
}

async function seedTeams() {
  const newTeams: any[] = [];

  await Promise.all(
    Array(TEAM_COUNT)
      .fill(0)
      .map(() => createRandomTeam())
  );
  console.log('Seeded teams', newTeams.length);
  return newTeams;

  async function createRandomTeam() {
    const name = faker.company.name();
    const team = await client.team.create({
      data: {
        name,
        slug: name
          .toString()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, ''),
      },
    });
    newTeams.push(team);
  }
}

async function seedTeamMembers(users: any[], teams: any[]) {
  const newTeamMembers: any[] = [];
  const roles = ['OWNER', 'MEMBER'];
  for (const user of users) {
    const count = Math.floor(Math.random() * (TEAM_COUNT - 1)) + 2;
    const teamUsed = new Set();
    for (let j = 0; j < count; j++) {
      try {
        let teamId;
        do {
          teamId = teams[Math.floor(Math.random() * TEAM_COUNT)].id;
        } while (teamUsed.has(teamId));
        teamUsed.add(teamId);
        newTeamMembers.push({
          role:
            user.email === ADMIN_EMAIL
              ? 'OWNER'
              : user.email === USER_EMAIL
                ? 'MEMBER'
                : roles[Math.floor(Math.random() * 2)],
          teamId,
          userId: user.id,
        });
      } catch (ex) {
        console.log(ex);
      }
    }
  }

  await client.teamMember.createMany({
    data: newTeamMembers,
  });
  console.log('Seeded team members', newTeamMembers.length);
}

async function seedInvitations(teams: any[], users: any[]) {
  const newInvitations: any[] = [];
  for (const team of teams) {
    const count = Math.floor(Math.random() * users.length) + 2;
    for (let j = 0; j < count; j++) {
      try {
        const invitation = await client.invitation.create({
          data: {
            teamId: team.id,
            invitedBy: users[Math.floor(Math.random() * users.length)].id,
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
      }
    }
  }

  console.log('Seeded invitations', newInvitations.length);

  return newInvitations;
}

// Feature keys for the MDR SaaS plan matrix
const PLAN_FEATURES = [
  // MDR features
  { key: 'mdr_projects', label: 'MDR Projects', hasLimit: true },
  { key: 'compilation', label: 'Compile to PDF', hasLimit: false },
  { key: 'branding', label: 'Custom Branding', hasLimit: false },
  { key: 'transmittals', label: 'Transmittal System', hasLimit: false },
  { key: 'share_links', label: 'Public Share Links', hasLimit: false },
  { key: 'version_history', label: 'Document Version History', hasLimit: false },
  { key: 'export_excel', label: 'Excel/CSV Export', hasLimit: false },
  { key: 'cross_mdr_sharing', label: 'Cross-MDR Section Sharing', hasLimit: false },
  { key: 'email_inbox', label: 'Email Inbox', hasLimit: false },
  { key: 'file_conversion', label: 'DOCX/XLSX→PDF Conversion', hasLimit: false },
  // Team features
  { key: 'team_members', label: 'Team Members', hasLimit: true },
  { key: 'api_keys', label: 'API Keys', hasLimit: false },
  { key: 'webhooks', label: 'Outbound Webhooks', hasLimit: false },
  { key: 'audit_log', label: 'Audit Log', hasLimit: false },
  // Advanced
  { key: 'sso', label: 'SAML/OIDC SSO', hasLimit: false },
  { key: 'dsync', label: 'SCIM Directory Sync', hasLimit: false },
  { key: 'storage_gb', label: 'Storage (GB)', hasLimit: true },
];

type PlanConfig = {
  name: string;
  description: string;
  sortOrder: number;
  isDefault: boolean;
  features: Record<string, { enabled: boolean; limit?: number }>;
};

const PLANS: PlanConfig[] = [
  {
    name: 'Free',
    description: 'For individuals getting started',
    sortOrder: 0,
    isDefault: true,
    features: {
      mdr_projects:       { enabled: true,  limit: 1 },
      compilation:        { enabled: false },
      branding:           { enabled: false },
      transmittals:       { enabled: false },
      share_links:        { enabled: false },
      version_history:    { enabled: false },
      export_excel:       { enabled: false },
      cross_mdr_sharing:  { enabled: false },
      email_inbox:        { enabled: false },
      file_conversion:    { enabled: false },
      team_members:       { enabled: true,  limit: 1 },
      api_keys:           { enabled: false },
      webhooks:           { enabled: false },
      audit_log:          { enabled: false },
      sso:                { enabled: false },
      dsync:              { enabled: false },
      storage_gb:         { enabled: true,  limit: 1 },
    },
  },
  {
    name: 'Starter',
    description: 'For small engineering teams',
    sortOrder: 1,
    isDefault: false,
    features: {
      mdr_projects:       { enabled: true,  limit: 1 },
      compilation:        { enabled: true  },
      branding:           { enabled: true  },
      transmittals:       { enabled: true  },
      share_links:        { enabled: true  },
      version_history:    { enabled: false },
      export_excel:       { enabled: true  },
      cross_mdr_sharing:  { enabled: false },
      email_inbox:        { enabled: false },
      file_conversion:    { enabled: true  },
      team_members:       { enabled: true,  limit: 5 },
      api_keys:           { enabled: true  },
      webhooks:           { enabled: false },
      audit_log:          { enabled: false },
      sso:                { enabled: false },
      dsync:              { enabled: false },
      storage_gb:         { enabled: true,  limit: 10 },
    },
  },
  {
    name: 'Professional',
    description: 'For growing project teams',
    sortOrder: 2,
    isDefault: false,
    features: {
      mdr_projects:       { enabled: true,  limit: 5 },
      compilation:        { enabled: true  },
      branding:           { enabled: true  },
      transmittals:       { enabled: true  },
      share_links:        { enabled: true  },
      version_history:    { enabled: true  },
      export_excel:       { enabled: true  },
      cross_mdr_sharing:  { enabled: true  },
      email_inbox:        { enabled: true  },
      file_conversion:    { enabled: true  },
      team_members:       { enabled: true,  limit: 25 },
      api_keys:           { enabled: true  },
      webhooks:           { enabled: true  },
      audit_log:          { enabled: true  },
      sso:                { enabled: false },
      dsync:              { enabled: false },
      storage_gb:         { enabled: true,  limit: 100 },
    },
  },
  {
    name: 'Enterprise',
    description: 'Unlimited scale for large organisations',
    sortOrder: 3,
    isDefault: false,
    features: {
      mdr_projects:       { enabled: true,  limit: -1 },
      compilation:        { enabled: true  },
      branding:           { enabled: true  },
      transmittals:       { enabled: true  },
      share_links:        { enabled: true  },
      version_history:    { enabled: true  },
      export_excel:       { enabled: true  },
      cross_mdr_sharing:  { enabled: true  },
      email_inbox:        { enabled: true  },
      file_conversion:    { enabled: true  },
      team_members:       { enabled: true,  limit: -1 },
      api_keys:           { enabled: true  },
      webhooks:           { enabled: true  },
      audit_log:          { enabled: true  },
      sso:                { enabled: true  },
      dsync:              { enabled: true  },
      storage_gb:         { enabled: true,  limit: -1 },
    },
  },
];

async function seedSubscriptionPlans() {
  for (const plan of PLANS) {
    const created = await client.subscriptionPlan.upsert({
      where: { name: plan.name } as any,
      create: {
        name: plan.name,
        description: plan.description,
        sortOrder: plan.sortOrder,
        isDefault: plan.isDefault,
        isActive: true,
      },
      update: {
        description: plan.description,
        sortOrder: plan.sortOrder,
        isDefault: plan.isDefault,
        isActive: true,
      },
    });

    for (const [feature, config] of Object.entries(plan.features)) {
      await client.planFeature.upsert({
        where: { planId_feature: { planId: created.id, feature } },
        create: {
          planId: created.id,
          feature,
          enabled: config.enabled,
          limit: config.limit ?? null,
        },
        update: {
          enabled: config.enabled,
          limit: config.limit ?? null,
        },
      });
    }

    console.log(`Seeded plan: ${plan.name}`);
  }
}

async function init() {
  const users = await seedUsers();
  const teams = await seedTeams();
  await seedTeamMembers(users, teams);
  await seedInvitations(teams, users);
  await seedSubscriptionPlans();
}

init();
