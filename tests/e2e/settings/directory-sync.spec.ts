import { expect, test } from '@playwright/test';
import {
  signUp,
  user,
  team,
  signIn,
  loggedInCheck,
  cleanup,
} from '../support/helper';

const DIRECTORY_NAME = 'TestConnection';
const DIRECTORY_NAME_NEW = 'TestConnection1';

test.afterAll(async () => {
  await cleanup();
});

test('Should be able to create DSync connection', async ({ page }) => {
  await signUp(page, user.name, team.name, user.email, user.password);

  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await navigateToDSyncSettings(page);

  await expect(
    page.getByRole('heading', { name: 'No directories found.' })
  ).toBeVisible();

  await createDSyncConnection(page, DIRECTORY_NAME);

  await expect(await page.getByLabel('SCIM Endpoint').inputValue()).toContain(
    'http://localhost:4002/api/scim/v2.0/'
  );
  await expect(page.getByLabel('Directory name')).toHaveValue(DIRECTORY_NAME);
});

test('Should be able to show existing DSync connections', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await navigateToDSyncSettings(page);

  await expect(page.getByRole('cell', { name: DIRECTORY_NAME })).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Azure SCIM v2.0' })
  ).toBeVisible();
  await expect(page.getByLabel('Active')).toBeVisible();
});

test('Should be able to edit the DSync connection', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await navigateToDSyncSettings(page);

  await page.getByLabel('Edit').click();
  await expect(
    page.getByRole('heading', { name: 'Edit DSync Connection' })
  ).toBeVisible();

  await page.getByLabel('Directory name').fill(DIRECTORY_NAME_NEW);
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Connection updated')).toBeVisible();

  await page.goto(`/teams/${team.slug}/directory-sync`);
  await page.waitForURL(`/teams/${team.slug}/directory-sync`);
  await expect(
    page.getByRole('heading', { name: 'Manage DSync Connections' })
  ).toBeVisible();

  await expect(
    await page.getByRole('cell', { name: DIRECTORY_NAME_NEW })
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Azure SCIM v2.0' })
  ).toBeVisible();
  await expect(page.getByLabel('Active')).toBeVisible();
});

test('Should be able to disable the DSync connection', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await navigateToDSyncSettings(page);

  await page.getByLabel('Edit').click();
  await expect(
    page.getByRole('heading', { name: 'Edit DSync Connection' })
  ).toBeVisible();

  await page
    .locator('label')
    .filter({ hasText: 'Active' })
    .locator('span')
    .click();
  await expect(
    page.getByRole('heading', { name: 'Do you want to deactivate the' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Connection updated')).toBeVisible();
  await expect(page.getByLabel('Inactive')).toBeVisible();
});

test('Should be able to enable the DSync connection', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await navigateToDSyncSettings(page);

  await page.getByLabel('Edit').click();
  await expect(
    page.getByRole('heading', { name: 'Edit DSync Connection' })
  ).toBeVisible();

  await page
    .locator('label')
    .filter({ hasText: 'Inactive' })
    .locator('span')
    .click();
  await expect(
    page.getByRole('heading', { name: 'Do you want to activate the' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Connection updated')).toBeVisible();
  await expect(page.getByLabel('Active')).toBeVisible();
});

test('Should be able to delete the DSync connection', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await navigateToDSyncSettings(page);

  await page.getByLabel('Edit').click();
  await expect(
    page.getByRole('heading', { name: 'Edit DSync Connection' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(
    page.getByRole('heading', { name: 'Are you sure you want to' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Connection deleted')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'No directories found.' })
  ).toBeVisible();
});

async function navigateToDSyncSettings(page) {
  await page.goto(`/teams/${team.slug}/directory-sync`);
  await page.waitForURL(`/teams/${team.slug}/directory-sync`);
  await expect(
    page.getByRole('heading', { name: 'Manage DSync Connections' })
  ).toBeVisible();
}

async function createDSyncConnection(page, name: string) {
  await page.getByRole('button', { name: 'New Directory' }).click();
  await expect(
    page.getByRole('heading', { name: 'Create DSync Connection' })
  ).toBeVisible();

  await page.getByLabel('Directory name').fill(name);
  await page.getByRole('button', { name: 'Create Directory' }).click();
  await expect(page.getByText('Connection created')).toBeVisible();
}
