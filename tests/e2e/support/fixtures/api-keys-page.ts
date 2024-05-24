import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class ApiKeysPage {
  constructor(
    public readonly page: Page,
    public readonly teamSlug: string
  ) {}

  async goto() {
    await this.page.goto(`/teams/${this.teamSlug}/api-keys`);
    await this.page.waitForURL(`/teams/${this.teamSlug}/api-keys`);
    await this.page.waitForSelector('text=API Keys');
  }

  async createNewApiKey(name: string) {
    await this.fillNewApiKeyName(name);
    await this.page
      .getByLabel('Modal')
      .getByRole('button', { name: 'Create API Key' })
      .click();
    await expect(this.page.getByRole('textbox').inputValue()).toBeTruthy();
  }

  async fillNewApiKeyName(name: string) {
    await this.page.getByRole('button', { name: 'Create API Key' }).click();
    await this.page.waitForSelector(`text=New API Key`);
    await this.page.getByPlaceholder('My API Key').fill(name);
  }

  async apiKeyVisible(name: string) {
    await expect(this.page.locator(`text=${name}`).first()).toBeVisible();
  }

  async revokeApiKey() {
    await this.page.getByRole('button', { name: 'Revoke' }).click();
    await this.page.waitForSelector(
      'text=Are you sure you want to revoke this API key?'
    );
    await this.page.getByRole('button', { name: 'Revoke API Key' }).click();
    await this.page.waitForSelector('text=API key deleted successfully');
  }

  async isApiKeyNameLengthErrorVisible() {
    await expect(
      await this.page.getByText('Name should have at most 50 characters')
    ).toBeVisible();
  }

  async isCreateApiKeyButtonDisabled() {
    await expect(
      await this.page
        .getByLabel('Modal')
        .getByRole('button', { name: 'Create API Key' })
        .isDisabled()
    ).toBeTruthy();
  }

  async checkNoApiKeys() {
    await expect(
      this.page.getByRole('heading', { name: "You haven't created any API" })
    ).toBeVisible();
  }
}
