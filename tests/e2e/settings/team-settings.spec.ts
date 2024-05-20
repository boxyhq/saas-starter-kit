import { expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { signIn, signUp } from '../support/helper';

const user = {
  name: 'Jackson',
  email: 'jackson@example.com',
  password: 'password',
} as const;

const team = {
  name: 'Example',
  slug: 'example',
} as const;

const teamNewInfo = {
  name: 'New Team Name',
  slug: 'new team example',
  sluggified: 'new-team-example',
} as const;

test.afterAll(async () => {
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();
  await prisma.$disconnect();
});

test('Should be able to update team name', async ({ page }) => {
  await signUp(page, user.name, team.name, user.email, user.password);

  await signIn(page, user.email, user.password);

  await page.waitForURL(`/teams/${team.slug}/settings`);
  await page.waitForSelector('text=Team Settings');

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
  await signIn(page, user.email, user.password);

  await page.waitForURL(`/teams/${team.slug}/settings`);
  await page.waitForSelector('text=Team Settings');

  await page.locator('input[name="name"]').fill('');
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
});

test('Should not allow to update team name with more than 50 characters', async ({
  page,
}) => {
  await signIn(page, user.email, user.password);

  await page.waitForURL(`/teams/${team.slug}/settings`);
  await page.waitForSelector('text=Team Settings');

  await page.locator('input[name="name"]').fill('a'.repeat(51));
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
  await expect(
    await page.getByText('Team name should have at most 50 characters')
  ).toBeVisible();
});

test('Should be able to update team slug', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await page.waitForURL(`/teams/${team.slug}/settings`);
  await page.waitForSelector('text=Team Settings');

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
  await signIn(page, user.email, user.password);

  await page.waitForURL(`/teams/${teamNewInfo.sluggified}/settings`);
  await page.waitForSelector('text=Team Settings');

  await page.locator('input[name="slug"]').fill('');
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
});

test('Should not allow to update team slug with more than 50 characters', async ({
  page,
}) => {
  await signIn(page, user.email, user.password);

  await page.waitForURL(`/teams/${teamNewInfo.sluggified}/settings`);
  await page.waitForSelector('text=Team Settings');

  await page.locator('input[name="slug"]').fill('a'.repeat(51));
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
  await expect(
    await page.getByText('Slug should have at most 50 characters')
  ).toBeVisible();
});

test('Should be able to set domain in team settings', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await page.waitForURL(`/teams/${teamNewInfo.sluggified}/settings`);
  await page.waitForSelector('text=Team Settings');

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
  await signIn(page, user.email, user.password);

  await page.waitForURL(`/teams/${teamNewInfo.sluggified}/settings`);
  await page.waitForSelector('text=Team Settings');

  await page.locator('input[name="domain"]').fill('a'.repeat(256) + '.com');
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
  await expect(
    await page.getByText('Domain should have at most 253 characters')
  ).toBeVisible();
});

test('Should not allow to set invalid domain', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await page.waitForURL(`/teams/${teamNewInfo.sluggified}/settings`);
  await page.waitForSelector('text=Team Settings');

  await page.locator('input[name="domain"]').fill('example');
  await expect(
    await page.getByRole('button', { name: 'Save Changes' }).isDisabled()
  ).toBeTruthy();
  await expect(
    await page.getByText('Enter a domain name in the format example.com')
  ).toBeVisible();
});
