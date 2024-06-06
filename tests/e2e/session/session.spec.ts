import { chromium, test as base } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';
import { SettingsPage } from '../support/fixtures/settings-page';
import { SecurityPage } from '../support/fixtures/security-page';

type SessionFixture = {
  loginPage: LoginPage;
  joinPage: JoinPage;
  securityPage: SecurityPage;
  settingsPage: SettingsPage;
};

const test = base.extend<SessionFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  joinPage: async ({ page }, use) => {
    const joinPage = new JoinPage(page, user, team.name);
    await joinPage.goto();
    await use(joinPage);
  },
  securityPage: async ({ page }, use) => {
    const ssoPage = new SecurityPage(page);
    await use(ssoPage);
  },
  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page, user.name);
    await use(settingsPage);
  },
});

test.afterAll(async () => {
  await cleanup();
});

test.afterEach(async () => {
  await prisma.session.deleteMany();
});

test('Session is shown in security page ', async ({
  joinPage,
  loginPage,
  settingsPage,
  securityPage,
}) => {
  await joinPage.goto();
  await joinPage.signUp();

  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await settingsPage.goto('security');

  await securityPage.checkCurrentSession();
});

test('2 session are shown in security page ', async ({ loginPage }) => {
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

test('On Remove session user logs out', async ({ loginPage }) => {
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
