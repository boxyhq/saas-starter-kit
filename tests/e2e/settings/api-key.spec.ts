import { expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { signUp, user, team, signIn, loggedInCheck } from '../support/helper';

const apiKeyName = 'New Api Key';

test.afterAll(async () => {
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

test('Should be able to create new API Key', async ({ page }) => {
  await signUp(page, user.name, team.name, user.email, user.password);

  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await page.goto(`/teams/${team.slug}/api-keys`);
  await page.waitForURL(`/teams/${team.slug}/api-keys`);
  await page.waitForSelector('text=API Keys');

  await page.getByRole('button', { name: 'Create API Key' }).click();
  await page.waitForSelector(`text=${apiKeyName}`);
  await page.getByPlaceholder('My API Key').fill(apiKeyName);
  await page
    .getByLabel('Modal')
    .getByRole('button', { name: 'Create API Key' })
    .click();
  await expect(await page.getByRole('textbox').inputValue()).toBeTruthy();

  await page.reload();
  await expect(await page.locator(`text=${apiKeyName}`).first()).toBeVisible();
});

test('Should be able to delete API Key', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await page.goto(`/teams/${team.slug}/api-keys`);
  await page.waitForURL(`/teams/${team.slug}/api-keys`);
  await page.waitForSelector('text=API Keys');

  await expect(await page.locator(`text=${apiKeyName}`).first()).toBeVisible();

  await page.getByRole('button', { name: 'Revoke' }).click();
  await page.waitForSelector(
    'text=Are you sure you want to revoke this API key?'
  );
  await page.getByRole('button', { name: 'Revoke API Key' }).click();
  await page.waitForSelector('text=API key deleted successfully');
  await expect(
    page.getByRole('heading', { name: "You haven't created any API" })
  ).toBeVisible();
});
