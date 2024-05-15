import { expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { signUp } from '../support/helper';

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
  await signUp(page, user.name, team.name, user.email, user.password);
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
