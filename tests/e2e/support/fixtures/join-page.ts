import type { Page, Locator } from '@playwright/test';

export class JoinPage {
  private readonly nameBox: Locator;
  private readonly teamNameBox: Locator;
  private readonly emailBox: Locator;
  private readonly passwordBox: Locator;
  private readonly createAccountButton: Locator;
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
  }

  async goto() {
    await this.page.goto('/auth/join');
    await this.page.waitForURL('/auth/join');
    await this.page.waitForSelector('text=Get started');
  }

  async signUp() {
    await this.nameBox.fill(this.user.name);
    await this.teamNameBox.fill(this.teamName);
    await this.emailBox.fill(this.user.email);
    await this.passwordBox.fill(this.user.password);
    await this.createAccountButton.click();
    await this.page.waitForURL('/auth/login');
    await this.page.waitForSelector(
      'text=You have successfully created your account.'
    );
  }
}
