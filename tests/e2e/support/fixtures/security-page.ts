import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class SecurityPage {
  constructor(public readonly page: Page) {}

  async checkCurrentSession() {
    await expect(this.page.locator('text=This browser')).toBeVisible();
  }

  async checkOtherSession() {
    await expect(
      await this.page.getByText('Other', {
        exact: true,
      })
    ).toBeDefined();
  }

  async removeCurrentSession() {
    await this.page
      .getByRole('row', { name: 'This browser Remove' })
      .getByRole('button')
      .click();
    await this.page.waitForSelector('text=Remove Browser Session');

    await this.page
      .getByLabel('Modal')
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async isPageVisible() {
    await this.page.waitForSelector('text=Browser Sessions');
  }
}
