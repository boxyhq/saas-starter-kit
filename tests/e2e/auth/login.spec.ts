import { test, expect } from "@playwright/test";

test("Should navigate to login page", async ({ page }) => {
  page.goto("/");
  await expect(page).toHaveURL("http://localhost:4002/auth/login");
});
