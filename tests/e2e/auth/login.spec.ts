import { expect, test } from '@playwright/test';

test('Should navigate to login page', async ({ page }) => {
  page.goto('/');
  await expect(page).toHaveURL('/auth/login');
});
