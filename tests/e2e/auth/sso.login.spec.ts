import { expect, test } from '@playwright/test';
import {
  createSSOConnection,
  deleteSSOConnection,
  signUp,
  ssoLogin,
  user,
  team,
  loggedInCheck,
  cleanup,
} from '../support/helper';

const secondTeam = {
  name: 'BoxyHQ',
  slug: 'boxyhq',
} as const;

const ssoMetadataUrl = [
  `${process.env.MOCKSAML_ORIGIN}/api/saml/metadata`,
  `${process.env.MOCKSAML_ORIGIN}/api/namespace/test/saml/metadata`,
];

test.afterAll(async () => {
  await cleanup();
});

test('Sign up and create SSO connection', async ({ page }) => {
  await signUp(page, user.name, team.name, user.email, user.password);

  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await loggedInCheck(page, team.slug);

  await createSSOConnection(page, team.slug, ssoMetadataUrl[0]);
});

test('Login with SSO', async ({ page }) => {
  await ssoLogin(page, user.email);
});

test('Create a new team', async ({ page }) => {
  await ssoLogin(page, user.email);
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
  await ssoLogin(page, user.email);
  await expect(
    page.getByRole('heading', { name: 'Team Settings' })
  ).toBeVisible();
});

test('Create SSO connection for new team', async ({ page }) => {
  await ssoLogin(page, user.email);

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

  await deleteSSOConnection(page, secondTeam.slug);
});

test('Delete SSO connection', async ({ page }) => {
  await ssoLogin(page, user.email);

  await deleteSSOConnection(page, team.slug);
});
