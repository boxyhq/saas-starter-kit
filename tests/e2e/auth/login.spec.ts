import { test } from '@playwright/test';

import {
  signUp,
  user,
  team,
  loggedInCheck,
  cleanup,
  signIn,
} from '../support/helper';

test.afterAll(async () => {
  await cleanup();
});

test('Should signup a new user', async ({ page }) => {
  await signUp(page, user.name, team.name, user.email, user.password);
});

test('Should login a user', async ({ page }) => {
  await signIn(page, user.email, user.password);
  await page.waitForURL('/dashboard');
  await loggedInCheck(page, team.slug);
});
