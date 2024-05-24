import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class DirectorySyncPage {
  constructor(
    public readonly page: Page,
    public readonly teamSlug: string
  ) {}

  async goto() {
    await this.page.goto(`/teams/${this.teamSlug}/directory-sync`);
    await this.page.waitForURL(`/teams/${this.teamSlug}/directory-sync`);
    await expect(
      this.page.getByRole('heading', { name: 'Manage DSync Connections' })
    ).toBeVisible();
  }
  async createConnection(name: string) {
    await this.page.getByRole('button', { name: 'New Directory' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Create DSync Connection' })
    ).toBeVisible();

    await this.page.getByLabel('Directory name').fill(name);
    await this.page.getByRole('button', { name: 'Create Directory' }).click();
    await expect(this.page.getByText('Connection created')).toBeVisible();
  }

  async checkEmptyConnectionList() {
    await expect(
      this.page.getByRole('heading', { name: 'No directories found.' })
    ).toBeVisible();
  }

  async verifyNewConnection(name: string) {
    await expect(
      await this.page.getByLabel('SCIM Endpoint').inputValue()
    ).toContain('http://localhost:4002/api/scim/v2.0/');
    await expect(this.page.getByLabel('Directory name')).toHaveValue(name);
  }

  async verifyListedConnection(name: string) {
    await expect(this.page.getByRole('cell', { name })).toBeVisible();
    await expect(
      this.page.getByRole('cell', { name: 'Azure SCIM v2.0' })
    ).toBeVisible();
    await expect(this.page.getByLabel('Active')).toBeVisible();
  }

  async editConnection(name: string) {
    await this.page.getByLabel('Edit').click();
    await expect(
      this.page.getByRole('heading', { name: 'Edit DSync Connection' })
    ).toBeVisible();

    await this.page.getByLabel('Directory name').fill(name);
    await this.page.getByRole('button', { name: 'Save' }).click();

    await expect(this.page.getByText('Connection updated')).toBeVisible();
  }

  async disableConnection() {
    await this.page.getByLabel('Edit').click();
    await expect(
      this.page.getByRole('heading', { name: 'Edit DSync Connection' })
    ).toBeVisible();

    await this.page
      .locator('label')
      .filter({ hasText: 'Active' })
      .locator('span')
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Do you want to deactivate the' })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
    await expect(this.page.getByText('Connection updated')).toBeVisible();
    await expect(this.page.getByLabel('Inactive')).toBeVisible();
  }

  async enableConnection() {
    await this.page.getByLabel('Edit').click();
    await expect(
      this.page.getByRole('heading', { name: 'Edit DSync Connection' })
    ).toBeVisible();

    await this.page
      .locator('label')
      .filter({ hasText: 'Inactive' })
      .locator('span')
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Do you want to activate the' })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
    await expect(this.page.getByText('Connection updated')).toBeVisible();
    await expect(this.page.getByLabel('Active')).toBeVisible();
  }

  async deleteConnection() {
    await this.page.getByLabel('Edit').click();
    await expect(
      this.page.getByRole('heading', { name: 'Edit DSync Connection' })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Are you sure you want to' })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
    await expect(this.page.getByText('Connection deleted')).toBeVisible();
  }
}
