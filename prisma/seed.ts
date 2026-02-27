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

// ─── Help Centre Seed ────────────────────────────────────────────────────────

const HELP_CATEGORIES = [
  { slug: 'getting-started', title: 'Getting Started', icon: '🚀', description: 'New to the platform? Start here.' },
  { slug: 'mdr-projects', title: 'MDR Projects', icon: '📁', description: 'Creating and managing Master Document Registers.' },
  { slug: 'documents', title: 'Documents', icon: '📄', description: 'Uploading, versioning, and organising documents.' },
  { slug: 'transmittals', title: 'Transmittals', icon: '📬', description: 'Issuing and tracking document transmittals.' },
  { slug: 'pdf-compilation', title: 'PDF Compilation', icon: '🖨️', description: 'Compiling your MDR into a single branded PDF.' },
  { slug: 'email-inbox', title: 'Email Inbox', icon: '📥', description: 'Routing inbound emails to MDR sections.' },
  { slug: 'team-members', title: 'Team & Members', icon: '👥', description: 'Inviting collaborators and managing roles.' },
  { slug: 'branding', title: 'Branding', icon: '🎨', description: 'Customising your PDFs with your company branding.' },
  { slug: 'share-links', title: 'Share Links', icon: '🔗', description: 'Sharing documents securely with external parties.' },
  { slug: 'templates', title: 'Templates', icon: '📋', description: 'Using document templates for consistent submissions.' },
  { slug: 'billing', title: 'Billing & Plans', icon: '💳', description: 'Managing your subscription and usage.' },
  { slug: 'account-settings', title: 'Account Settings', icon: '⚙️', description: 'Profile, security, and notification preferences.' },
  { slug: 'api', title: 'API & Integrations', icon: '🔌', description: 'Using the REST API and webhooks.' },
  { slug: 'troubleshooting', title: 'Troubleshooting', icon: '🛠️', description: 'Common issues and how to fix them.' },
  { slug: 'compliance', title: 'Compliance & GDPR', icon: '🔒', description: 'Data privacy, exports, and account deletion.' },
];

const HELP_ARTICLES: Array<{ categorySlug: string; title: string; slug: string; excerpt: string }> = [
  { categorySlug: 'getting-started', title: 'Welcome to the Platform', slug: 'welcome', excerpt: 'A quick overview of what you can do.' },
  { categorySlug: 'getting-started', title: 'Creating Your First Team', slug: 'create-first-team', excerpt: 'Set up your organisation in minutes.' },
  { categorySlug: 'getting-started', title: 'Inviting Team Members', slug: 'invite-team-members', excerpt: 'Collaborate with colleagues on your projects.' },
  { categorySlug: 'mdr-projects', title: 'Creating a New MDR Project', slug: 'create-mdr-project', excerpt: 'Start a new Master Document Register.' },
  { categorySlug: 'mdr-projects', title: 'Understanding Project Sections', slug: 'mdr-sections', excerpt: 'How sections organise your document register.' },
  { categorySlug: 'mdr-projects', title: 'Finalising a Project', slug: 'finalize-mdr', excerpt: 'Lock a project once all documents are submitted.' },
  { categorySlug: 'documents', title: 'Uploading Documents', slug: 'upload-documents', excerpt: 'Supported file types and upload limits.' },
  { categorySlug: 'documents', title: 'Document Versioning', slug: 'document-versions', excerpt: 'Track changes and restore previous versions.' },
  { categorySlug: 'documents', title: 'Document Status Workflow', slug: 'document-status', excerpt: 'Understanding IFR, IFC, AFC and other statuses.' },
  { categorySlug: 'transmittals', title: 'Creating a Transmittal', slug: 'create-transmittal', excerpt: 'Bundle documents for formal submission.' },
  { categorySlug: 'transmittals', title: 'Issuing and Cover Sheets', slug: 'issue-transmittal', excerpt: 'Issue a transmittal and generate the cover sheet PDF.' },
  { categorySlug: 'pdf-compilation', title: 'Triggering a Compilation', slug: 'trigger-compilation', excerpt: 'Generate a single merged PDF of your MDR.' },
  { categorySlug: 'pdf-compilation', title: 'Compilation Statuses', slug: 'compilation-status', excerpt: 'What QUEUED, PROCESSING, DONE and FAILED mean.' },
  { categorySlug: 'email-inbox', title: 'Setting Up an Email Inbox', slug: 'setup-email-inbox', excerpt: 'Receive documents by email automatically.' },
  { categorySlug: 'email-inbox', title: 'Routing Inbound Emails', slug: 'route-email', excerpt: 'Assign attachments to the correct MDR section.' },
  { categorySlug: 'team-members', title: 'Member Roles Explained', slug: 'member-roles', excerpt: 'Owner, Admin, Editor, Viewer — what each can do.' },
  { categorySlug: 'branding', title: 'Adding Your Company Logo', slug: 'add-logo', excerpt: 'Upload and position your logo on compiled PDFs.' },
  { categorySlug: 'share-links', title: 'Creating a Share Link', slug: 'create-share-link', excerpt: 'Share your MDR with clients without giving them an account.' },
  { categorySlug: 'billing', title: 'Upgrading Your Plan', slug: 'upgrade-plan', excerpt: 'Move to a higher tier to unlock more features.' },
  { categorySlug: 'account-settings', title: 'Enabling Two-Factor Authentication', slug: 'enable-2fa', excerpt: 'Secure your account with an authenticator app.' },
  { categorySlug: 'compliance', title: 'Exporting Your Data', slug: 'export-data', excerpt: 'Download all your personal data under GDPR.' },
  { categorySlug: 'troubleshooting', title: 'Compilation Failed — What to Do', slug: 'compilation-failed', excerpt: 'Common causes and fixes for failed PDF compilations.' },
];

async function seedHelpContent() {
  // Upsert categories
  const categoryMap: Record<string, string> = {};
  for (let i = 0; i < HELP_CATEGORIES.length; i++) {
    const cat = HELP_CATEGORIES[i];
    const record = await client.helpCategory.upsert({
      where: { slug: cat.slug },
      create: { ...cat, order: i },
      update: { title: cat.title, description: cat.description, icon: cat.icon, order: i },
    });
    categoryMap[cat.slug] = record.id;
    console.log(`Seeded help category: ${cat.title}`);
  }

  // Upsert articles
  for (const art of HELP_ARTICLES) {
    const categoryId = categoryMap[art.categorySlug];
    if (!categoryId) continue;
    await client.helpArticle.upsert({
      where: { slug: art.slug },
      create: {
        categoryId,
        slug: art.slug,
        title: art.title,
        excerpt: art.excerpt,
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: art.excerpt }] }] },
        status: 'PUBLISHED',
      },
      update: { title: art.title, excerpt: art.excerpt, categoryId },
    });
    console.log(`Seeded help article: ${art.title}`);
  }
}

async function init() {
  const users = await seedUsers();
  const teams = await seedTeams();
  await seedTeamMembers(users, teams);
  await seedInvitations(teams, users);
  await seedSubscriptionPlans();
  await seedHelpContent();
}

init();
