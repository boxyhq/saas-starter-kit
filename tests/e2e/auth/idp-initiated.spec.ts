import { test } from '@playwright/test';
import { user, team, cleanup } from '../support/helper';
import { LoginPage } from '../support/fixtures/login-page';
import { JoinPage } from '../support/fixtures/join-page';
import { SSOPage } from '../support/fixtures/sso-page';

const SSO_METADATA_URL = `${process.env.MOCKSAML_ORIGIN}/api/saml/metadata`;

test.afterAll(async () => {
  await cleanup();
});

test('Sign up and create SSO connection', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const joinPage = new JoinPage(page, user, team.name);
  const ssoPage = new SSOPage(page, team.slug);

  await joinPage.goto();
  await joinPage.signUp();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await ssoPage.goto();
  await ssoPage.createSSOConnection(SSO_METADATA_URL);

  await loginPage.logout(user.name);
  await loginPage.idpInitiatedLogin();
  await loginPage.loggedInCheck(team.slug);

  await ssoPage.goto();
  await ssoPage.openEditSSOConnectionView();
  await ssoPage.deleteSSOConnection();
});
