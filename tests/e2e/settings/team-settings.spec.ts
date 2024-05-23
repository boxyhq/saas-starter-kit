import { expect, test } from '@playwright/test';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';

const teamNewInfo = {
  name: 'New Team Name',
  slug: 'new team example',
  sluggified: 'new-team-example',
} as const;

test.afterAll(async () => {
  await cleanup();
});

test('Should be able to update team name', async ({ page }) => {
  const joinPage = new JoinPage(page, user, team.name);
  await joinPage.goto();
  await joinPage.signUp();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await page.locator('input[name="name"]').fill(teamNewInfo.name);
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(
    await page.getByText('Changes saved successfully.')
  ).toBeVisible();

  await page.reload();
  await page.waitForSelector('text=Team Settings');
  await expect(await page.locator('input[name="name"]').inputValue()).toBe(
    teamNewInfo.name
  );
});

test('Should not allow to update team name with empty value', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await page.locator('input[name="name"]').fill('');
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
});

test('Should not allow to update team name with more than 50 characters', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await page.locator('input[name="name"]').fill('a'.repeat(51));
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
  await expect(
    await page.getByText('Team name should have at most 50 characters')
  ).toBeVisible();
});

test('Should be able to update team slug', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await page.locator('input[name="slug"]').fill(teamNewInfo.slug);
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(
    await page.getByText('Changes saved successfully.')
  ).toBeVisible();

  await page.reload();
  await page.waitForSelector('text=Team Settings');
  await expect(await page.locator('input[name="slug"]').inputValue()).toBe(
    teamNewInfo.sluggified
  );
});

test('Should not allow empty slug', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  await page.locator('input[name="slug"]').fill('');
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
});

test('Should not allow to update team slug with more than 50 characters', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  await page.locator('input[name="slug"]').fill('a'.repeat(51));
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
  await expect(
    await page.getByText('Slug should have at most 50 characters')
  ).toBeVisible();
});

test('Should be able to set domain in team settings', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  await page.locator('input[name="domain"]').fill('example.com');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(
    await page.getByText('Changes saved successfully.')
  ).toBeVisible();
  await page.reload();
  await page.waitForSelector('text=Team Settings');
  await expect(await page.locator('input[name="domain"]').inputValue()).toBe(
    'example.com'
  );
});

test('Should not allow to set domain with more than 255 characters', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  await page.locator('input[name="domain"]').fill('a'.repeat(256) + '.com');
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
  await expect(
    await page.getByText('Domain should have at most 253 characters')
  ).toBeVisible();
});

test('Should not allow to set invalid domain', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  await page.locator('input[name="domain"]').fill('example');
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
  await expect(
    await page.getByText('Enter a domain name in the format example.com')
  ).toBeVisible();
});
