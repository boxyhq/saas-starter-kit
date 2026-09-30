import { type Page, type Locator, expect } from '@playwright/test';

export class JoinPage {
  private readonly emailBox: Locator;
  private readonly nameBox: Locator;
  private readonly signUpButton: Locator;
  private readonly passwordMethodButton: Locator;
  private readonly passwordBox: Locator;

  constructor(
    public readonly page: Page,
    public readonly user: {
      name: string;
      email: string;
      password: string;
    },
    public readonly teamName: string
  ) {
    this.emailBox = this.page.locator('input[name="traits.email"]');
    this.nameBox = this.page.locator('input[name="traits.name"]');
    this.signUpButton = this.page.getByRole('button', {
      name: 'Sign up',
      exact: true,
    });
    this.passwordMethodButton = this.page.getByRole('button', {
      name: /Password/,
    });
    this.passwordBox = this.page.locator('input[name="password"]');
  }

  async goto() {
    await this.page.goto('/auth/join');
    await expect(this.emailBox).toBeVisible();
  }

  async signUp() {
    await this.emailBox.fill(this.user.email);
    await this.nameBox.fill(this.user.name);
    await this.signUpButton.click();

    await this.passwordMethodButton.click();

    await expect(this.passwordBox).toBeVisible();
    await this.passwordBox.fill(this.user.password);
    await this.signUpButton.click();

    await this.page.waitForURL(/\/auth\/verify-email|\/dashboard|\/teams/);
  }
}
