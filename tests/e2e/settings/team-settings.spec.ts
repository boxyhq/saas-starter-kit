import { expect, test } from '@playwright/test';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';
import { SettingsPage } from '../support/fixtures/settings-page';

const teamNewInfo = {
  name: 'New Team Name',
  slug: 'new team example',
  sluggified: 'new-team-example',
} as const;

test.afterAll(async () => {
  await cleanup();
});

test('Should be able to update team name', async ({ page }) => {
  const joinPage = new JoinPage(page, user, team.name);
  await joinPage.goto();
  await joinPage.signUp();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.updateTeamName(teamNewInfo.name);

  await page.reload();
  await settingsPage.isSettingsPageVisible();
  await settingsPage.checkTeamName(teamNewInfo.name);
});

test('Should not allow to update team name with empty value', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.fillTeamName('');
  await settingsPage.isSaveButtonDisabled();
});

test('Should not allow to update team name with more than 50 characters', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.fillTeamName('a'.repeat(51));
  await settingsPage.isSaveButtonDisabled();
  await settingsPage.isTeamNameLengthErrorVisible();
});

test('Should be able to update team slug', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.updateTeamSlug(teamNewInfo.slug);

  await page.reload();
  await settingsPage.isSettingsPageVisible();
  await settingsPage.checkTeamSlug(teamNewInfo.sluggified);
});

test('Should not allow empty slug', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.fillTeamSlug('');
  await settingsPage.isSaveButtonDisabled();
});

test('Should not allow to update team slug with more than 50 characters', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.fillTeamSlug('a'.repeat(51));
  await settingsPage.isSaveButtonDisabled();
  await settingsPage.isTeamSlugLengthErrorVisible();
});

test('Should be able to set domain in team settings', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.updateDomain('example.com');
  await page.reload();
  await settingsPage.isSettingsPageVisible();
  await settingsPage.checkDomain('example.com');
});

test('Should not allow to set domain with more than 253 characters', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.fillDomain('a'.repeat(256) + '.com');
  await settingsPage.isSaveButtonDisabled();
  await settingsPage.isDomainLengthErrorVisible();
});

test('Should not allow to set invalid domain', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  const settingsPage = new SettingsPage(page, user.name);
  await settingsPage.fillDomain('example');
  await settingsPage.isSaveButtonDisabled();
  await settingsPage.isDomainInvalidErrorVisible();
});
