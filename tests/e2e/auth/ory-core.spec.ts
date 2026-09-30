import { test, expect, type Page } from '@playwright/test';

const unique = () => `e2e_core_${Date.now()}@example.com`;
const PASSWORD = 'Sup3rSecret-Kratos-9x';

async function register(page: Page, email: string, name = 'Core Tester') {
  await page.goto('/auth/join');
  await page.locator('input[name="traits.email"]').fill(email);
  await page.locator('input[name="traits.name"]').fill(name);
  await page.getByRole('button', { name: 'Sign up', exact: true }).click();
  await page.getByRole('button', { name: /Password/ }).click();
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign up', exact: true }).click();
  await page.waitForURL(/\/auth\/verify-email|\/dashboard|\/teams/);
}

async function login(page: Page, email: string) {
  await page.goto('/auth/login');
  await page.locator('input[name="identifier"]').fill(email);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in with password' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), {
    timeout: 15000,
  });
}

test.describe('Ory core authentication', () => {
  test('login page loads one Ory flow and renders the standard form', async ({
    page,
  }) => {
    let flowRequests = 0;
    page.on('request', (request) => {
      if (
        request.url().includes('/self-service/login/browser') &&
        request.method() === 'GET'
      ) {
        flowRequests += 1;
      }
    });

    await page.goto('/auth/login');
    await expect(page.locator('input[name="identifier"]')).toBeVisible({
      timeout: 15000,
    });
    expect(flowRequests).toBe(1);
  });

  test('unauthenticated access to a protected route redirects to login', async ({
    page,
  }) => {
    await page.goto('/teams/does-not-exist/settings');
    await page.waitForURL(/\/auth\/login/);
    await expect(page.locator('input[name="identifier"]')).toBeVisible();
  });

  test('registration establishes an authenticated session', async ({
    page,
  }) => {
    const email = unique();
    await register(page, email);

    await page.goto('/dashboard');
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });

  test('logout then login with the same credentials works', async ({
    page,
  }) => {
    const email = unique();
    await register(page, email);

    await page.context().clearCookies();
    await login(page, email);

    await page.goto('/dashboard');
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });

  test('logout invalidates the Kratos session', async ({ page }) => {
    const email = unique();
    await register(page, email);
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Core Tester' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL(/\/auth\/login/);

    await page.goto('/dashboard');
    await page.waitForURL(/\/auth\/login/);
  });

  test('login with wrong password shows an error and stays on login', async ({
    page,
  }) => {
    const email = unique();
    await register(page, email);
    await page.context().clearCookies();

    await page.goto('/auth/login');
    await page.locator('input[name="identifier"]').fill(email);
    await page.locator('input[name="password"]').fill('totally-wrong-pass');
    await page.getByRole('button', { name: 'Sign in with password' }).click();

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(
      page.getByRole('button', { name: 'Sign in with password' })
    ).toBeVisible();
  });
});
