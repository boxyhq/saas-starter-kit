import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class SecurityPage {
  private readonly otherSessionLabel: Locator;
  private readonly removeCurrentSessionButton: Locator;
  private readonly removeButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.otherSessionLabel = this.page.getByText('Other', {
      exact: true,
    });
    this.removeCurrentSessionButton = this.page
      .getByRole('row', { name: 'This browser Remove' })
      .getByRole('button');
    this.removeButton = this.page
      .getByLabel('Modal')
      .getByRole('button', { name: 'Remove' });
  }

  async checkCurrentSession() {
    await expect(this.page.locator('text=This browser')).toBeVisible();
  }

  async checkOtherSession() {
    await expect(await this.otherSessionLabel).toBeDefined();
  }

  async removeCurrentSession() {
    await this.removeCurrentSessionButton.click();
    await expect(
      this.page.getByRole('heading', {
        name: 'Remove Browser Session',
      })
    ).toBeVisible();
    await this.removeButton.click();
  }

  async isPageVisible() {
    await expect(
      this.page.getByRole('heading', {
        name: 'Browser Sessions',
      })
    ).toBeVisible();
  }
}
