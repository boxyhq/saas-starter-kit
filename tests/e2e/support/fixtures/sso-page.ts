import type { Page, Locator } from '@playwright/test';

export class SSOPage {
  private readonly newConnectionButton: Locator;
  private readonly metadataUrlField: Locator;
  private readonly saveButton: Locator;
  constructor(
    public readonly page: Page,
    public readonly teamSlug: string
  ) {
    this.newConnectionButton = page.getByRole('button', {
      name: 'New Connection',
    });
    this.metadataUrlField = page.getByPlaceholder(
      'Paste the Metadata URL here'
    );
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async goto() {
    await this.page.goto(`/teams/${this.teamSlug}/sso`);
    await this.page.waitForURL(`/teams/${this.teamSlug}/sso`);
    await this.page.waitForSelector('text=Manage SSO Connections');
  }

  async createSSOConnection(metadataUrl: string) {
    await this.newConnectionButton.click();
    await this.metadataUrlField.fill(metadataUrl);
    await this.saveButton.click();
    await this.page.waitForURL(`/teams/${this.teamSlug}/sso`);
    await this.page.waitForSelector('text=saml.example.com');
  }
}
