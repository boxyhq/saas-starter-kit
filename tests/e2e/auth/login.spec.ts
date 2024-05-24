import { test } from '@playwright/test';

import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';

test.afterAll(async () => {
  await cleanup();
});

test('Should signup a new user', async ({ page }) => {
  const joinPage = new JoinPage(page, user, team.name);
  await joinPage.goto();
  await joinPage.signUp();
});

test('Should login a user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.page.waitForURL('/dashboard');
  await loginPage.loggedInCheck(team.slug);
});
