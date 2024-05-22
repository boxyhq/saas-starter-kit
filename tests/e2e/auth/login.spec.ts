import { expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { signUp, user, team, loggedInCheck, cleanup } from '../support/helper';

test.afterAll(async () => {
  await cleanup();
});

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
  await loggedInCheck(page, team.slug);
});

test.afterAll(async () => {
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
