import { expect, test } from '@playwright/test';
import { prisma } from '@/lib/prisma';

const userCred = {
  name: 'test',
  email: 'test@ggxd.com',
  password: 'Test123#',
  emailVerified: new Date(),
};

test.beforeEach(async () => {
  await prisma.user.create({
    data: userCred,
  });

  console.log('user created');
});

test('Should navigate to login page', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page).toHaveURL('/auth/login');
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
