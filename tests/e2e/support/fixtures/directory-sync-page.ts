import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class DirectorySyncPage {
  private readonly pageHeader;
  private readonly createDirectoryButton;
  private readonly createDsyncHeader;
  private readonly directoryNameField;
  private readonly createDirectorySubmitButton;
  private readonly createDirectorySuccessMessage;
  private readonly noDirectoriesHeader;
  private readonly scimEndpointLabel;
  private readonly nameColumnHeader;
  private readonly azureScimCell;
  private readonly activeLabel;
  private readonly editButton;
  private readonly editDsyncHeader;
  private readonly saveButton;
  private readonly connectionUpdatedMessage;
  private readonly activeStatusToggle;
  private readonly deactivateConfirmationHeader;
  private readonly confirmButton;
  private readonly inactiveLabel;
  private readonly activateConfirmationHeader;
  private readonly deleteButton;
  private readonly deleteConfirmationHeader;
  private readonly connectionDeletedMessage;

  constructor(
    public readonly page: Page,
    public readonly teamSlug: string
  ) {
    this.pageHeader = this.page.getByRole('heading', {
      name: 'Manage DSync Connections',
    });
    this.createDirectoryButton = this.page.getByRole('button', {
      name: 'New Directory',
    });
    this.createDsyncHeader = this.page.getByRole('heading', {
      name: 'Create DSync Connection',
    });
    this.directoryNameField = this.page.getByLabel('Directory name');
    this.createDirectorySubmitButton = this.page.getByRole('button', {
      name: 'Create Directory',
    });
    this.createDirectorySuccessMessage =
      this.page.getByText('Connection created');
    this.noDirectoriesHeader = this.page.getByRole('heading', {
      name: 'No directories found.',
    });
    this.scimEndpointLabel = this.page.getByLabel('SCIM Endpoint');
    this.nameColumnHeader = this.page.getByRole('columnheader', {
      name: 'name',
    });
    this.azureScimCell = this.page.getByRole('cell', {
      name: 'Azure SCIM v2.0',
    });
    this.activeLabel = this.page.getByLabel('Active');
    this.editButton = this.page.getByLabel('Edit');
    this.editDsyncHeader = this.page.getByRole('heading', {
      name: 'Edit DSync Connection',
    });
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.connectionUpdatedMessage = this.page.getByText('Connection updated');
    this.activeStatusToggle = this.page
      .locator('label')
      .filter({ hasText: 'Active' })
      .locator('span');
    this.deactivateConfirmationHeader = this.page.getByRole('heading', {
      name: 'Do you want to deactivate the',
    });
    this.confirmButton = this.page.getByRole('button', { name: 'Confirm' });
    this.inactiveLabel = this.page.getByLabel('Inactive');
    this.activateConfirmationHeader = this.page.getByRole('heading', {
      name: 'Do you want to activate the',
    });
    this.deleteButton = this.page.getByRole('button', { name: 'Delete' });
    this.deleteConfirmationHeader = this.page.getByRole('heading', {
      name: 'Are you sure you want to',
    });
    this.connectionDeletedMessage = this.page.getByText('Connection deleted');
  }

  async goto() {
    await this.page.goto(`/teams/${this.teamSlug}/directory-sync`);
    await this.page.waitForURL(`/teams/${this.teamSlug}/directory-sync`);
    await expect(this.pageHeader).toBeVisible();
  }

  async createConnection(name: string) {
    await this.createDirectoryButton.click();
    await expect(this.createDsyncHeader).toBeVisible();
    await this.directoryNameField.fill(name);
    await this.createDirectorySubmitButton.click();
    await expect(this.createDirectorySuccessMessage).toBeVisible();
  }

  async checkEmptyConnectionList() {
    await expect(this.noDirectoriesHeader).toBeVisible();
  }

  async verifyNewConnection(name: string) {
    await expect(this.scimEndpointLabel).toBeVisible();
    await expect(await this.scimEndpointLabel.inputValue()).toContain(
      'http://localhost:4002/api/scim/v2.0/'
    );
    await expect(this.directoryNameField).toHaveValue(name);
  }

  async verifyListedConnection(name: string) {
    await expect(this.nameColumnHeader).toBeVisible();
    await expect(this.nameCell(name)).toBeVisible();
    await expect(this.azureScimCell).toBeVisible();
    await expect(this.activeLabel).toBeVisible();
  }

  async editConnection(name: string) {
    await this.navigateToEditConnection();
    await this.directoryNameField.fill(name);
    await this.saveButton.click();
    await expect(this.connectionUpdatedMessage).toBeVisible();
  }

  async disableConnection() {
    await this.navigateToEditConnection();
    await this.activeStatusToggle.click();
    await expect(this.deactivateConfirmationHeader).toBeVisible();
    await this.confirmButton.click();
    await expect(this.connectionUpdatedMessage).toBeVisible();
    await expect(this.inactiveLabel).toBeVisible();
  }

  async enableConnection() {
    await this.navigateToEditConnection();
    await this.page
      .locator('label')
      .filter({ hasText: 'Inactive' })
      .locator('span')
      .click();
    await expect(this.activateConfirmationHeader).toBeVisible();
    await this.confirmButton.click();
    await expect(this.connectionUpdatedMessage).toBeVisible();
    await expect(this.activeLabel).toBeVisible();
  }

  async deleteConnection() {
    await this.navigateToEditConnection();
    await this.deleteButton.click();
    await expect(this.deleteConfirmationHeader).toBeVisible();
    await this.confirmButton.click();
    await expect(this.connectionDeletedMessage).toBeVisible();
  }

  private async navigateToEditConnection() {
    await this.editButton.click();
    await expect(this.editDsyncHeader).toBeVisible();
  }

  private nameCell(name: string) {
    return this.page.getByRole('cell', { name });
  }
}
