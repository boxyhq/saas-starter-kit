import { Page } from '@playwright/test';
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
  const ssoPage = new SSOPage(page, teamSlug);
  await ssoPage.goto();

  await ssoPage.openEditSSOConnectionView();
  await ssoPage.deleteSSOConnection();
}

export async function ssoLogin(page: Page, email: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.ssoLogin(email);
  await page.waitForSelector('text=Team Settings');
}

export async function signIn(page, email, password, skipGotoPage = false) {
  const loginPage = new LoginPage(page);
  if (!skipGotoPage) {
    await loginPage.goto();
  }
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
