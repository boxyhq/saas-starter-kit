import { expect, test } from '@playwright/test';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';

const apiKeyName = 'New Api Key';

test.afterAll(async () => {
  await cleanup();
});

test('Should be able to create new API Key', async ({ page }) => {
  const joinPage = new JoinPage(page, user, team.name);
  await joinPage.goto();
  await joinPage.signUp();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

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
  await expect(page.getByRole('textbox').inputValue()).toBeTruthy();

  await page.reload();
  await expect(page.locator(`text=${apiKeyName}`).first()).toBeVisible();
});

test('Should be able to delete API Key', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await page.goto(`/teams/${team.slug}/api-keys`);
  await page.waitForURL(`/teams/${team.slug}/api-keys`);
  await page.waitForSelector('text=API Keys');

  await expect(page.locator(`text=${apiKeyName}`).first()).toBeVisible();

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
