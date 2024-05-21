import { Page } from '@playwright/test';

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
  await page.goto(`/teams/${teamSlug}/sso`);
  await page.waitForURL(`/teams/${teamSlug}/sso`);
  await page.waitForSelector('text=Manage SSO Connections');
  await page.getByRole('button', { name: 'New Connection' }).click();
  await page.getByPlaceholder('Paste the Metadata URL here').fill(metadataUrl);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForURL(`/teams/${teamSlug}/sso`);
  await page.waitForSelector('text=saml.example.com');
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
  await page.goto('/auth/login');
  await page.waitForURL('/auth/login');
  await page.getByRole('link', { name: 'Continue with SSO' }).click();
  await page.waitForSelector('text=Sign in with SAML SSO');
  await page.getByPlaceholder('user@boxyhq.com').fill(email);
  await page.getByRole('button', { name: 'Continue with SSO' }).click();
  await page.waitForSelector('text=SAML SSO Login');
  await page.getByRole('button', { name: 'Sign In' }).click();
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

export async function signIn(page, email, password) {
  await page.goto('/auth/login');
  await page.waitForURL('/auth/login');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export async function loggedInCheck(
  page,
  teamSlug: string,
  customRoute?: string
) {
  await page.waitForURL(customRoute || `/teams/${teamSlug}/settings`);
  await page.waitForSelector('text=Team Settings');
}
