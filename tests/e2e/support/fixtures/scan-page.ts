import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class ScanPage {
  private readonly urlInput: Locator;
  private readonly scanButton: Locator;
  private readonly resultsHeading: Locator;

  constructor(public readonly page: Page) {
    this.urlInput = this.page.getByPlaceholder('https://example.com');
    this.scanButton = this.page.getByRole('button', { name: 'Scan' });
    this.resultsHeading = this.page.getByRole('heading', { name: /Results/i });
  }

  async goto() {
    await this.page.goto('/scan');
    await this.page.waitForURL('/scan');
    await expect(this.urlInput).toBeVisible();
  }

  async scan(url: string) {
    await this.urlInput.fill(url);
    await this.scanButton.click();
  }

  async resultsVisible() {
    await expect(this.resultsHeading).toBeVisible();
  }
}
