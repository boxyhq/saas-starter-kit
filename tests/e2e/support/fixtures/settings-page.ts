import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class SettingsPage {
  private readonly newTeamMenu: Locator;
  private readonly newTeamNameInput: Locator;
  private readonly createTeamDialogButton: Locator;

  constructor(
    public readonly page: Page,
    public readonly username: string
  ) {
    this.newTeamMenu = this.page.getByRole('link', { name: 'New Team' });
    this.newTeamNameInput = this.page.getByPlaceholder('Team Name');
    this.createTeamDialogButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Create Team' });
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

  async isSettingsPageVisible() {
    await this.page.waitForSelector('text=Team Settings');
  }

  async fillTeamName(teamName: string) {
    await this.page.locator('input[name="name"]').fill(teamName);
  }

  async isSaveButtonDisabled() {
    await expect(
      await this.page.getByRole('button', { name: 'Save Changes' }).isDisabled()
    ).toBeTruthy();
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
      await this.page.getByText('Changes saved successfully.')
    ).toBeVisible();
  }

  async fillTeamSlug(teamSlug: string) {
    await this.page.locator('input[name="slug"]').fill(teamSlug);
  }

  async updateTeamSlug(newTeamSlug: string) {
    await this.fillTeamSlug(newTeamSlug);
    await this.clickSaveButton();
    await expect(
      await this.page.getByText('Changes saved successfully.')
    ).toBeVisible();
  }

  async fillDomain(domain: string) {
    await this.page.locator('input[name="domain"]').fill(domain);
  }

  async updateDomain(domain: string) {
    await this.fillDomain(domain);
    await this.clickSaveButton();
    await expect(
      await this.page.getByText('Changes saved successfully.')
    ).toBeVisible();
  }

  async checkTeamName(teamName: string) {
    await expect(
      await this.page.locator('input[name="name"]').inputValue()
    ).toBe(teamName);
  }

  async checkTeamSlug(teamSlug: string) {
    await expect(
      await this.page.locator('input[name="slug"]').inputValue()
    ).toBe(teamSlug);
  }

  async checkDomain(domain: string) {
    await expect(
      await this.page.locator('input[name="domain"]').inputValue()
    ).toBe(domain);
  }

  async createNewTeam(teamName: string) {
    await this.page.getByText('Example').first().click();
    await this.newTeamMenu.click();
    await this.page.waitForSelector('text=Create Team');
    await this.newTeamNameInput.fill(teamName);
    await this.createTeamDialogButton.click();

    await this.page.waitForSelector('text=Team created successfully.');
  }

  async goto(pageName: 'security' | 'api-keys') {
    await this.page.goto(`/settings/${pageName}`);
    await this.page.waitForURL(`/settings/${pageName}`);
  }
}
