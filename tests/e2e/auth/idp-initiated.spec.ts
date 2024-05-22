import { expect, test } from '@playwright/test';
import {
  createSSOConnection,
  deleteSSOConnection,
  signUp,
  user,
  team,
  loggedInCheck,
  cleanup,
  signIn,
} from '../support/helper';

const SSO_METADATA_URL = `${process.env.MOCKSAML_ORIGIN}/api/saml/metadata`;
const IDP_LOGIN_URL = `${process.env.MOCKSAML_ORIGIN}/saml/login`;
const ACS_URL = `${process.env.APP_URL}/api/oauth/saml`;

test.afterAll(async () => {
  await cleanup();
});

test('Sign up and create SSO connection', async ({ page }) => {
  await signUp(page, user.name, team.name, user.email, user.password);
  await signIn(page, user.email, user.password, true);
  await loggedInCheck(page, team.slug);

  await createSSOConnection(page, team.slug, SSO_METADATA_URL);

  await page.locator('button').filter({ hasText: user.name }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back' })
  ).toBeVisible();
  await page.goto(IDP_LOGIN_URL);
  await page.getByPlaceholder('https://sso.eu.boxyhq.com/api').fill(ACS_URL);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForSelector('text=Team Settings');

  await deleteSSOConnection(page, team.slug);
});
