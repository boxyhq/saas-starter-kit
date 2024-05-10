import { expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';

const user = {
  name: 'Jackson',
  email: 'jackson@example.com',
  password: 'password',
} as const;

const team = {
  name: 'Example',
  slug: 'example',
} as const;

const secondTeam = {
  name: 'BoxyHQ',
  slug: 'boxyhq',
} as const;

const ssoMetadataUrl = ['https://mocksaml.com/api/saml/metadata', 'https://mocksaml.com/api/namespace/test/saml/metadata'];

test.afterAll(async () => {
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

test('Sign up and create SSO connection', async ({ page }) => {
  await page.goto('/auth/join');
  await expect(page).toHaveURL('/auth/join');
  await expect(
    page.getByRole('heading', { name: 'Get started' })
  ).toBeVisible();
  await page.getByPlaceholder('Your Name').fill(user.name);
  await page.getByPlaceholder('Team Name').fill(team.name);
  await page.getByPlaceholder('example@boxyhq.com').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('/auth/login');
  await page.waitForSelector(
    'text=You have successfully created your account.'
  );
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(`/teams/${team.slug}/settings`);
  await page.waitForSelector('text=Team Settings');

  await createSSOConnection(page, team.slug, ssoMetadataUrl[0]);
});

test('Login with SSO', async ({ page }) => {
  await ssoLogin(page);
});

test('Create a new team', async ({ page }) => {
  await ssoLogin(page);
  await page.getByText('Example').first().click();
  await page.getByRole('link', { name: 'New Team' }).click();
  await page.waitForSelector('text=Create Team');
  await page.getByPlaceholder('Team Name').fill(secondTeam.name);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Create Team' })
    .click();

  await page.waitForSelector('text=Team created successfully.');
});

test('SSO login with 2 teams & one SSO connection', async ({ page }) => {
  await ssoLogin(page);
  await expect(
    page.getByRole('heading', { name: 'Team Settings' })
  ).toBeVisible();
});

test('Create SSO connection for new team', async ({ page }) => {
  await ssoLogin(page);

  await createSSOConnection(page, secondTeam.slug, ssoMetadataUrl[1]);
});

test('SSO login with 2 teams & two SSO connection', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page).toHaveURL('/auth/login');
  await page.getByRole('link', { name: 'Continue with SSO' }).click();
  await page.waitForSelector('text=Sign in with SAML SSO');
  await page.getByPlaceholder('user@boxyhq.com').fill(user.email);
  await page.getByRole('button', { name: 'Continue with SSO' }).click();
  await page.waitForSelector('text=User belongs to multiple');
  await expect(page.getByText('User belongs to multiple')).toBeVisible();
  await page.getByPlaceholder('boxyhq').fill(team.slug);
  await page.getByRole('button', { name: 'Continue with SSO' }).click();
  await page.waitForSelector('text=SAML SSO Login');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForSelector('text=Team Settings');

  await page.goto(`/teams/${secondTeam.slug}/sso`);
  await page.waitForURL(`/teams/${secondTeam.slug}/sso`);
  await page.waitForSelector('text=Manage SSO Connections');

  await page.waitForSelector('text=saml.example.com');
  await page.getByLabel('Edit').click();
  await page.waitForSelector('text=Edit SSO Connection');
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForSelector(
    'text=Are you sure you want to delete the Connection? This action cannot be undone and will permanently delete the Connection.'
  );
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForSelector('text=Manage SSO Connections');
});

test('Delete SSO connection', async ({ page }) => {
  await ssoLogin(page);

  await page.goto(`/teams/${team.slug}/sso`);
  await page.waitForURL(`/teams/${team.slug}/sso`);
  await page.waitForSelector('text=Manage SSO Connections');

  await page.getByRole('link', { name: 'Single Sign-On' }).click();
  await page.waitForSelector('text=saml.example.com');
  await page.getByLabel('Edit').click();
  await page.waitForSelector('text=Edit SSO Connection');
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForSelector(
    'text=Are you sure you want to delete the Connection? This action cannot be undone and will permanently delete the Connection.'
  );
  await page.getByRole('button', { name: 'Confirm' }).click();
});

async function ssoLogin(page) {
  await page.goto('/auth/login');
  await expect(page).toHaveURL('/auth/login');
  await page.getByRole('link', { name: 'Continue with SSO' }).click();
  await page.waitForSelector('text=Sign in with SAML SSO');
  await page.getByPlaceholder('user@boxyhq.com').fill(user.email);
  await page.getByRole('button', { name: 'Continue with SSO' }).click();
  await page.waitForSelector('text=SAML SSO Login');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForSelector('text=Team Settings');
}

async function createSSOConnection(page, teamSlug, metadataUrl) {
  await page.goto(`/teams/${teamSlug}/sso`);
  await page.waitForURL(`/teams/${teamSlug}/sso`);
  await page.waitForSelector('text=Manage SSO Connections');
  await page.getByRole('button', { name: 'New Connection' }).click();
  await page.getByPlaceholder('Paste the Metadata URL here').fill(metadataUrl);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForURL(`/teams/${teamSlug}/sso`);
  await expect(page.getByRole('cell', { name: 'saml.example.com' })).toBeVisible();
}
