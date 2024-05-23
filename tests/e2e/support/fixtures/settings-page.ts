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

  async createNewTeam(teamName: string) {
    await this.page.getByText('Example').first().click();
    await this.newTeamMenu.click();
    await this.page.waitForSelector('text=Create Team');
    await this.newTeamNameInput.fill(teamName);
    await this.createTeamDialogButton.click();

    await this.page.waitForSelector('text=Team created successfully.');
  }
}
