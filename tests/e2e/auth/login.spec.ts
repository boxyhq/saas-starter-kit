import { test as base } from '@playwright/test';

import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';

type LoginFixture = {
  loginPage: LoginPage;
  joinPage: JoinPage;
};

const test = base.extend<LoginFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.credentialLogin(user.email, user.password);
    await use(loginPage);
  },
  joinPage: async ({ page }, use) => {
    const joinPage = new JoinPage(page, user, team.name);
    await joinPage.goto();
    await use(joinPage);
  },
});

test.afterAll(async () => {
  await cleanup();
});

test('Should signup a new user', async ({ joinPage }) => {
  await joinPage.signUp();
});

test('Should login a user', async ({ loginPage }) => {
  await loginPage.page.waitForURL('/dashboard');
  await loginPage.loggedInCheck(team.slug);
});
