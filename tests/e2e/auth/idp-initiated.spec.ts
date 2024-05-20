import { expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import {
  createSSOConnection,
  deleteSSOConnection,
  signUp,
  user,
  team,
} from '../support/helper';

const ssoMetadataUrl = `${process.env.MOCKSAML_ORIGIN}/api/saml/metadata`;
const idpLoginUrl = `${process.env.MOCKSAML_ORIGIN}/saml/login`;
const acsUrl = `${process.env.APP_URL}/api/oauth/saml`;

test.afterAll(async () => {
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

test('Sign up and create SSO connection', async ({ page }) => {
  await signUp(page, user.name, team.name, user.email, user.password);

  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(`/teams/${team.slug}/settings`);
  await page.waitForSelector('text=Team Settings');

  await createSSOConnection(page, team.slug, ssoMetadataUrl);

  await page.locator('button').filter({ hasText: 'Jackson' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back' })
  ).toBeVisible();
  await page.goto(idpLoginUrl);
  await page.getByPlaceholder('https://sso.eu.boxyhq.com/api').fill(acsUrl);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForSelector('text=Team Settings');

  await deleteSSOConnection(page, team.slug);
});
