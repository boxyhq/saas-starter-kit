import { chromium, expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { signUp, user, team, loggedInCheck, cleanup } from '../support/helper';

test.afterAll(async () => {
  await cleanup();
});

test.afterEach(async () => {
  await prisma.session.deleteMany();
});

test('Session is shown in security page ', async ({ page }) => {
  await signUp(page, user.name, team.name, user.email, user.password);

  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await loggedInCheck(page, team.slug);

  await page.goto(`/settings/security`);
  await page.waitForURL(`/settings/security`);

  await page.waitForSelector('text=Browser Sessions');
  expect(page.locator('text=This browser')).toBeVisible();
});

test('2 session are shown in security page ', async ({ page }) => {
  await page.goto('/auth/login');

  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await loggedInCheck(page, team.slug);

  const browser1 = await chromium.launch();
  const page1 = await browser1.newPage();

  await page1.goto('/auth/login');
  await page1.waitForURL('/auth/login');
  await page1.getByPlaceholder('Email').fill(user.email);
  await page1.getByPlaceholder('Password').fill(user.password);
  await page1.getByRole('button', { name: 'Sign in' }).click();
  await loggedInCheck(page1, team.slug);

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
  await page.goto('/auth/login');

  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await loggedInCheck(page, team.slug);

  const browser1 = await chromium.launch();
  const page1 = await browser1.newPage();

  await page1.goto('/auth/login');
  await page1.waitForURL('/auth/login');
  await page1.getByPlaceholder('Email').fill(user.email);
  await page1.getByPlaceholder('Password').fill(user.password);
  await page1.getByRole('button', { name: 'Sign in' }).click();
  await loggedInCheck(page1, team.slug);

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
