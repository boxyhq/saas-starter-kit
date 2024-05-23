import { chromium, expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';

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

  await page.goto(`/settings/security`);
  await page.waitForURL(`/settings/security`);

  await page.waitForSelector('text=Browser Sessions');
  expect(page.locator('text=This browser')).toBeVisible();
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

  await page1.goto(`/settings/security`);
  await page1.waitForURL(`/settings/security`);

  await page1.waitForSelector('text=Browser Sessions');

  await page1.waitForSelector('text=This browser');
  expect(
    await page1.getByText('Other', {
      exact: true,
    })
  ).toBeDefined();

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

  await page1.goto(`/settings/security`);
  await page1.waitForURL(`/settings/security`);

  await page1.waitForSelector('text=Browser Sessions');

  await page1.waitForSelector('text=This browser');
  expect(
    await page1.getByText('Other', {
      exact: true,
    })
  ).toBeDefined();

  await page1
    .getByRole('row', { name: 'This browser Remove' })
    .getByRole('button')
    .click();
  await page1.waitForSelector('text=Remove Browser Session');

  await page1
    .getByLabel('Modal')
    .getByRole('button', { name: 'Remove' })
    .click();
  expect(
    await page1.getByText('Welcome back', {
      exact: true,
    })
  ).toBeDefined();
  await browser1.close();
  await page.close();
});
