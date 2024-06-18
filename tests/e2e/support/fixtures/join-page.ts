import { type Page, type Locator, expect } from '@playwright/test';

export class JoinPage {
  private readonly nameBox: Locator;
  private readonly teamNameBox: Locator;
  private readonly emailBox: Locator;
  private readonly passwordBox: Locator;
  private readonly createAccountButton: Locator;
  private readonly createAccountSuccessMessage: string;
  constructor(
    public readonly page: Page,
    public readonly user: {
      name: string;
      email: string;
      password: string;
    },
    public readonly teamName: string
  ) {
    this.nameBox = this.page.getByPlaceholder('Your Name');
    this.teamNameBox = this.page.getByPlaceholder('Team Name');
    this.emailBox = this.page.getByPlaceholder('example@boxyhq.com');
    this.passwordBox = this.page.getByPlaceholder('Password');
    this.createAccountButton = page.getByRole('button', {
      name: 'Create Account',
    });
    this.createAccountSuccessMessage =
      'You have successfully created your account.';
  }

  async goto() {
    await this.page.goto('/auth/join');
    await expect(
      this.page.getByRole('heading', { name: 'Get started' })
    ).toBeVisible();
  }

  async signUp() {
    await this.nameBox.fill(this.user.name);
    await this.teamNameBox.fill(this.teamName);
    await this.emailBox.fill(this.user.email);
    await this.passwordBox.fill(this.user.password);
    await this.createAccountButton.click();
    await this.page.waitForURL('/auth/login');
    await expect(
      this.page
        .getByRole('status')
        .and(this.page.getByText(this.createAccountSuccessMessage))
    ).toBeVisible();
  }
}
