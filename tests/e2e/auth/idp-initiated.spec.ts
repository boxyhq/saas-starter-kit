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
import { LoginPage } from '../support/fixtures/login-page';

const SSO_METADATA_URL = `${process.env.MOCKSAML_ORIGIN}/api/saml/metadata`;

test.afterAll(async () => {
  await cleanup();
});

test('Sign up and create SSO connection', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await signUp(page, user.name, team.name, user.email, user.password);
  await signIn(page, user.email, user.password, true);
  await loggedInCheck(page, team.slug);

  await createSSOConnection(page, team.slug, SSO_METADATA_URL);

  await page.locator('button').filter({ hasText: user.name }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back' })
  ).toBeVisible();
  await loginPage.idpInitiatedLogin();
  await page.waitForSelector('text=Team Settings');

  await deleteSSOConnection(page, team.slug);
});
