import { expect, test } from '@playwright/test';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';
import { SSOPage } from '../support/fixtures/sso-page';
import { SettingsPage } from '../support/fixtures/settings-page';

const secondTeam = {
  name: 'BoxyHQ',
  slug: 'boxyhq',
} as const;

const SSO_METADATA_URL = [
  `${process.env.MOCKSAML_ORIGIN}/api/saml/metadata`,
  `${process.env.MOCKSAML_ORIGIN}/api/namespace/test/saml/metadata`,
];

test.afterAll(async () => {
  await cleanup();
});

test('Sign up and create SSO connection', async ({ page }) => {
  const joinPage = new JoinPage(page, user, team.name);
  await joinPage.goto();
  await joinPage.signUp();

  const loginPage = new LoginPage(page);
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const ssoPage = new SSOPage(page, team.slug);
  await ssoPage.goto();
  await ssoPage.createSSOConnection(SSO_METADATA_URL[0]);
});

test('Login with SSO', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.ssoLogin(user.email);
  await loginPage.loggedInCheck(team.slug);
});

test('Create a new team', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const settingsPage = new SettingsPage(page, user.name);

  await loginPage.goto();
  await loginPage.ssoLogin(user.email);
  await loginPage.loggedInCheck(team.slug);

  await settingsPage.createNewTeam(secondTeam.name);
});

test('SSO login with 2 teams & one SSO connection', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.ssoLogin(user.email);
  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.isSettingsPageVisible();
});

test('Create SSO connection for new team', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const ssoPage = new SSOPage(page, secondTeam.slug);

  await loginPage.goto();
  await loginPage.ssoLogin(user.email);
  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.isSettingsPageVisible();

  await ssoPage.goto();
  await ssoPage.createSSOConnection(SSO_METADATA_URL[1]);
});

test('SSO login with 2 teams & two SSO connection', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.ssoLogin(user.email, true);

  await loginPage.isMultipleTeamErrorVisible();

  await loginPage.ssoLoginWithSlug(team.slug);

  const ssoPage = new SSOPage(page, secondTeam.slug);
  await ssoPage.goto();

  await ssoPage.openEditSSOConnectionView();
  await ssoPage.deleteSSOConnection();
});

test('Delete SSO connection', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const ssoPage = new SSOPage(page, team.slug);

  await loginPage.goto();
  await loginPage.ssoLogin(user.email);
  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.isSettingsPageVisible();

  await ssoPage.goto();
  await ssoPage.openEditSSOConnectionView();
  await ssoPage.deleteSSOConnection();
});
