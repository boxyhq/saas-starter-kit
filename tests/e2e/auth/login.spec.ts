import { expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';

const user = {
  name: 'Jackson',
  email: 'jackson@boxyhq.com',
  password: 'password',
} as const;

const team = {
  name: 'BoxyHQ',
  slug: 'boxyhq',
} as const;

test('Should signup a new user', async ({ page }) => {
  await page.goto('/auth/join');
  await expect(page).toHaveURL('/auth/join');
  await expect(
    page.getByRole('heading', { name: 'Get started' })
  ).toBeVisible();
  await page.getByPlaceholder('Your name').fill(user.name);
  await page.getByPlaceholder('Team Name').fill(team.name);
  await page.getByPlaceholder('example@boxyhq.com').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('/auth/login');
  await page.waitForSelector(
    'text=You have successfully created your account.'
  );
});

test('Should login a user', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page).toHaveURL('/auth/login');
  await expect(
    page.getByRole('heading', { name: 'Welcome back' })
  ).toBeVisible();
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  await page.waitForURL(`/teams/${team.slug}/settings`);
  await page.waitForSelector('text=Settings');
});

test.afterAll(async () => {
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
