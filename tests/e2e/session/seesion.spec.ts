import { chromium, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';
import { SettingsPage } from '../support/fixtures/settings-page';
import { SecurityPage } from '../support/fixtures/security-page';

test.afterAll(async () => {
  await cleanup();
});

test.afterEach(async () => {
  await prisma.session.deleteMany();
});

test('Session is shown in security page ', async ({ page }) => {
  const joinPage = new JoinPage(page, user, team.name);
  await joinPage.goto();
  await joinPage.signUp();

  const loginPage = new LoginPage(page);
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const settingsPage = new SettingsPage(page, team.slug);
  await settingsPage.goto('security');

  const securityPage = new SecurityPage(page);
  await securityPage.checkCurrentSession();
});

test('2 session are shown in security page ', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const browser1 = await chromium.launch();
  const page1 = await browser1.newPage();

  const loginPage1 = new LoginPage(page1);
  await loginPage1.goto();
  await loginPage1.credentialLogin(user.email, user.password);
  await loginPage1.loggedInCheck(team.slug);

  const settingsPage = new SettingsPage(page1, team.slug);
  await settingsPage.goto('security');

  const securityPage = new SecurityPage(page1);
  await securityPage.isPageVisible();
  await securityPage.checkCurrentSession();
  await securityPage.checkOtherSession();

  await browser1.close();
});

test('On Remove session user logs out', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const browser1 = await chromium.launch();
  const page1 = await browser1.newPage();

  const loginPage1 = new LoginPage(page1);
  await loginPage1.goto();
  await loginPage1.credentialLogin(user.email, user.password);
  await loginPage1.loggedInCheck(team.slug);

  const settingsPage = new SettingsPage(page1, team.slug);
  await settingsPage.goto('security');

  const securityPage = new SecurityPage(page1);
  await securityPage.isPageVisible();
  await securityPage.checkCurrentSession();
  await securityPage.checkOtherSession();
  await securityPage.removeCurrentSession();

  loginPage1.isLoggedOut();

  await browser1.close();
  await securityPage.page.close();
});
