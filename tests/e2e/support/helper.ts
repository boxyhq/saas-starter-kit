import { Page, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import { LoginPage } from '../support/fixtures/login-page';
import { SSOPage } from './fixtures/sso-page';

export const user = {
  name: 'Jackson',
  email: 'jackson@example.com',
  password: 'password',
} as const;

export const team = {
  name: 'Example',
  slug: 'example',
} as const;

export async function createSSOConnection(
  page: Page,
  teamSlug: string,
  metadataUrl: string
) {
  const ssoPage = new SSOPage(page, teamSlug);
  await ssoPage.goto();
  await ssoPage.createSSOConnection(metadataUrl);
}

export async function deleteSSOConnection(page: Page, teamSlug: string) {
  await page.goto(`/teams/${teamSlug}/sso`);
  await page.waitForURL(`/teams/${teamSlug}/sso`);
  await page.waitForSelector('text=Manage SSO Connections');

  await page.getByRole('link', { name: 'Single Sign-On' }).click();
  await page.waitForSelector('text=saml.example.com');
  await page.getByLabel('Edit').click();
  await page.waitForSelector('text=Edit SSO Connection');
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForSelector(
    'text=Are you sure you want to delete the Connection? This action cannot be undone and will permanently delete the Connection.'
  );
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForSelector('text=Manage SSO Connections');
}

export async function ssoLogin(page: Page, email: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.ssoLogin(email);
  await page.waitForSelector('text=Team Settings');
}

export async function signUp(page, name, teamName, email, password) {
  await page.goto('/auth/join');
  await page.waitForURL('/auth/join');
  await page.waitForSelector('text=Get started');
  await page.getByPlaceholder('Your Name').fill(name);
  await page.getByPlaceholder('Team Name').fill(teamName);
  await page.getByPlaceholder('example@boxyhq.com').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('/auth/login');
  await page.waitForSelector(
    'text=You have successfully created your account.'
  );
}

export async function signIn(page, email, password, skipGotoPage = false) {
  const loginPage = new LoginPage(page);
  if (!skipGotoPage) {
    await loginPage.goto();
  }
  await expect(
    page.getByRole('heading', { name: 'Welcome back' })
  ).toBeVisible();
  await loginPage.credentialLogin(email, password);
}

export async function loggedInCheck(page, teamSlug: string) {
  const loginPage = new LoginPage(page);
  await loginPage.loggedInCheck(teamSlug);
}

export async function cleanup() {
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();
  await prisma.$disconnect();
}
