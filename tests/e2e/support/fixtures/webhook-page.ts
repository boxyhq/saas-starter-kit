import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class WebhookPage {
  private readonly heading: Locator;
  private readonly addWebhookButton: Locator;
  private readonly descriptionInput: Locator;
  private readonly endpointInput: Locator;
  private readonly createButton: Locator;

  constructor(
    public readonly page: Page,
    public readonly teamSlug: string
  ) {
    this.heading = this.page.getByRole('heading', { name: 'Webhooks' });
    this.addWebhookButton = this.page.getByRole('button', {
      name: 'Add Webhook',
    });
    this.descriptionInput = this.page.getByPlaceholder(
      'Description of what this endpoint is used for.'
    );
    this.endpointInput = this.page.getByPlaceholder(
      'https://api.example.com/svix-webhooks'
    );
    this.createButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Create Webhook' });
  }

  async goto() {
    await this.page.goto(`/teams/${this.teamSlug}/webhooks`);
    await this.page.waitForURL(`/teams/${this.teamSlug}/webhooks`);
    await expect(this.heading).toBeVisible();
  }

  async openCreateModal() {
    await this.addWebhookButton.click();
    await expect(
      this.page.getByRole('heading', { name: 'Create Webhook' })
    ).toBeVisible();
  }

  async fillDescription(text: string) {
    await this.descriptionInput.fill(text);
  }

  async fillEndpoint(text: string) {
    await this.endpointInput.fill(text);
  }

  async selectFirstEvent() {
    await this.page.getByLabel('member.created').check();
  }

  async submit() {
    await this.createButton.click();
  }
}
