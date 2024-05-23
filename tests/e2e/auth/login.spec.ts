import { test } from '@playwright/test';

import { user, team, loggedInCheck, cleanup, signIn } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';

test.afterAll(async () => {
  await cleanup();
});

test('Should signup a new user', async ({ page }) => {
  const joinPage = new JoinPage(page, user, team.name);
  await joinPage.goto();
  await joinPage.signUp();
});

test('Should login a user', async ({ page }) => {
  await signIn(page, user.email, user.password);
  await page.waitForURL('/dashboard');
  await loggedInCheck(page, team.slug);
});
