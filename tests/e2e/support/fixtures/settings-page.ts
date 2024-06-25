import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class SettingsPage {
  private readonly newTeamMenu: Locator;
  private readonly newTeamNameInput: Locator;
  private readonly createTeamDialogButton: Locator;
  private readonly removeTeamButton: Locator;
  private readonly removeTeamConfirmPrompt: Locator;
  private readonly updateTeamSuccessMessage: string;
  private readonly createTeamSuccessMessage: string;
  private readonly removeTeamSuccessMessage: string;
  private readonly deleteButton: Locator;

  constructor(
    public readonly page: Page,
    public readonly username: string
  ) {
    this.newTeamMenu = this.page.getByRole('link', { name: 'New Team' });
    this.newTeamNameInput = this.page.getByPlaceholder('Team Name');
    this.createTeamDialogButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Create Team' });
    this.removeTeamButton = this.page.getByRole('button', {
      name: 'Remove Team',
    });
    this.removeTeamConfirmPrompt = this.page.getByText(
      `Are you sure you want to delete the team? Deleting the team will delete all resources and data associated with the team forever.`
    );
    this.updateTeamSuccessMessage = 'Changes saved successfully.';
    this.createTeamSuccessMessage = 'Team created successfully.';
    this.removeTeamSuccessMessage = 'Team removed successfully.';

    this.deleteButton = page.getByRole('button', { name: 'Delete' });
  }

  async logout() {
    await this.page
      .locator('button')
      .filter({ hasText: this.username })
      .click();
    await this.page.getByRole('button', { name: 'Sign out' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Welcome back' })
    ).toBeVisible();
  }

  async isLoggedIn() {
    await this.page.waitForSelector('text=All Products');
  }

  async isSettingsPageVisible() {
    await expect(
      this.page.getByRole('heading', { name: 'Team Settings' })
    ).toBeVisible();
  }

  async fillTeamName(teamName: string) {
    await this.page.locator('input[name="name"]').fill(teamName);
  }

  async isSaveButtonDisabled() {
    await expect(
      this.page.getByRole('button', { name: 'Save Changes' })
    ).toBeDisabled();
  }

  async isTeamNameLengthErrorVisible() {
    await expect(
      await this.page.getByText('Team name should have at most 50 characters')
    ).toBeVisible();
  }

  async isTeamSlugLengthErrorVisible() {
    await expect(
      await this.page.getByText('Slug should have at most 50 characters')
    ).toBeVisible();
  }

  async isDomainLengthErrorVisible() {
    await expect(
      await this.page.getByText('Domain should have at most 253 characters')
    ).toBeVisible();
  }

  async isDomainInvalidErrorVisible() {
    await expect(
      await this.page.getByText('Enter a domain name in the format example.com')
    ).toBeVisible();
  }

  async clickSaveButton() {
    await this.page.getByRole('button', { name: 'Save Changes' }).click();
  }

  async updateTeamName(newTeamName: string) {
    await this.fillTeamName(newTeamName);
    await this.clickSaveButton();
    await expect(
      this.page
        .getByRole('status')
        .and(this.page.getByText(this.updateTeamSuccessMessage))
    ).toBeVisible();
  }

  async fillTeamSlug(teamSlug: string) {
    await this.page.locator('input[name="slug"]').fill(teamSlug);
  }

  async updateTeamSlug(newTeamSlug: string) {
    await this.fillTeamSlug(newTeamSlug);
    await this.clickSaveButton();
    await expect(
      this.page
        .getByRole('status')
        .and(this.page.getByText(this.updateTeamSuccessMessage))
    ).toBeVisible();
  }

  async fillDomain(domain: string) {
    await this.page.locator('input[name="domain"]').fill(domain);
  }

  async updateDomain(domain: string) {
    await this.fillDomain(domain);
    await this.clickSaveButton();
    await expect(
      this.page
        .getByRole('status')
        .and(this.page.getByText(this.updateTeamSuccessMessage))
    ).toBeVisible();
  }

  async checkTeamName(teamName: string) {
    await expect(this.page.locator('input[name="name"]')).toHaveValue(teamName);
  }

  async checkTeamSlug(teamSlug: string) {
    await expect(this.page.locator('input[name="slug"]')).toHaveValue(teamSlug);
  }

  async checkDomain(domain: string) {
    await expect(this.page.locator('input[name="domain"]')).toHaveValue(domain);
  }

  async createNewTeam(teamName: string) {
    await this.page.getByText('Example').first().click();
    await this.newTeamMenu.click();
    await expect(
      this.page.getByRole('heading', { name: 'Create Team' })
    ).toBeVisible();
    await this.newTeamNameInput.fill(teamName);
    await this.createTeamDialogButton.click();
    await expect(
      this.page
        .getByRole('status')
        .and(this.page.getByText(this.createTeamSuccessMessage))
    ).toBeVisible();
  }

  async removeTeam(teamSlug: string) {
    this.goto(teamSlug);
    this.removeTeamButton.click();
    await expect(this.removeTeamConfirmPrompt).toBeVisible();
    this.deleteButton.click();
    await expect(
      this.page
        .getByRole('status')
        .and(this.page.getByText(this.removeTeamSuccessMessage))
    ).toBeVisible();
  }

  async gotoSection(pageName: 'security' | 'api-keys') {
    await this.page.goto(`/settings/${pageName}`);
    await this.page.waitForURL(`/settings/${pageName}`);
  }

  async goto(teamSlug?: string) {
    await this.page.goto(`/teams/${teamSlug}/settings`);
    await this.page.waitForURL(`/teams/${teamSlug}/settings`);
  }
}
