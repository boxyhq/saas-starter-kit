import { expect, test } from '@playwright/test';
import {
  createSSOConnection,
  deleteSSOConnection,
  signUp,
  user,
  team,
  loggedInCheck,
  cleanup,
} from '../support/helper';

const ssoMetadataUrl = `${process.env.MOCKSAML_ORIGIN}/api/saml/metadata`;
const idpLoginUrl = `${process.env.MOCKSAML_ORIGIN}/saml/login`;
const acsUrl = `${process.env.APP_URL}/api/oauth/saml`;

test.afterAll(async () => {
  await cleanup();
});

test('Sign up and create SSO connection', async ({ page }) => {
  await signUp(page, user.name, team.name, user.email, user.password);

  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await loggedInCheck(page, team.slug);

  await createSSOConnection(page, team.slug, ssoMetadataUrl);

  await page.locator('button').filter({ hasText: 'Jackson' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back' })
  ).toBeVisible();
  await page.goto(idpLoginUrl);
  await page.getByPlaceholder('https://sso.eu.boxyhq.com/api').fill(acsUrl);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForSelector('text=Team Settings');

  await deleteSSOConnection(page, team.slug);
});
