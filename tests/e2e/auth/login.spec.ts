import { expect, test } from '@playwright/test';
import { prisma } from '@/lib/prisma';

const userCred = {
  name: 'Test',
  team: 'Test Teamg',
  email: 'test@gggxd.com',
  password: 'Test123#',
  emailVerified: new Date(),
};

test('Should navigate to login page', async ({ page }) => {
  await page.goto('/auth/join');
  await expect(page).toHaveURL('/auth/join');
  await expect(
    page.getByRole('heading', { name: 'Get started' })
  ).toBeVisible();
  await page.getByPlaceholder('Your name').fill(userCred.name);
  await page.getByPlaceholder('Team Name').fill(userCred.team);
  await page.getByPlaceholder('example@boxyhq.com').fill(userCred.email);
  await page.getByPlaceholder('Password').fill(userCred.password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Login
  await expect(page).toHaveURL('/auth/login');
  await expect(
    page.getByRole('heading', { name: 'Welcome back' })
  ).toBeVisible();
  await page.getByPlaceholder('Email').fill(userCred.email);
  await page.getByPlaceholder('Password').fill(userCred.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  // await expect(page).toHaveURL(/\/teams\/.*\/settings/);
});

test.afterEach(async () => {
  // 1. Clean the database
  const deleteUserDetails = prisma.user.delete({
    where: {
      email: userCred.email,
    },
  });
  await prisma.$transaction([deleteUserDetails]);

  // 2. Disconnect
  await prisma.$disconnect();

  console.log('Account disconnected successfully');
});
