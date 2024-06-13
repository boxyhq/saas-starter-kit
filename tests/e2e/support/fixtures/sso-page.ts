import { type Page, type Locator, expect } from '@playwright/test';

const MOCKLAB_ORIGIN = 'https://oauth.wiremockapi.cloud';
const MOCKLAB_CLIENT_ID = 'mocklab_oauth2';
const MOCKLAB_CLIENT_SECRET = 'mocklab_secret';
const MOCKLAB_DISCOVERY_ENDPOINT = `${MOCKLAB_ORIGIN}/.well-known/openid-configuration`;

export class SSOPage {
  private readonly pageHeader: Locator;
  private readonly newConnectionButton: Locator;
  private readonly metadataRawInput: Locator;
  private readonly metadataUrlInput: Locator;
  private readonly oidcDiscoveryUrlInput: Locator;
  private readonly oidcClientIdInput: Locator;
  private readonly oidcClientSecretInput: Locator;
  private readonly saveButton: Locator;
  private readonly deleteButton: Locator;
  private readonly confirmButton: Locator;
  private readonly toggleConnectionStatusCheckbox: Locator;
  private readonly toggleConnectionStatusLabel: Locator;
  private noConnectionsHeader: Locator;

  constructor(
    public readonly page: Page,
    public readonly teamSlug: string
  ) {
    this.pageHeader = this.page.getByRole('heading', {
      name: 'Manage SSO Connections',
    });
    this.newConnectionButton = page.getByRole('button', {
      name: 'New Connection',
    });
    this.metadataUrlInput = page.getByPlaceholder(
      'Paste the Metadata URL here'
    );
    this.metadataRawInput = page.getByPlaceholder('Paste the raw XML here');
    this.oidcDiscoveryUrlInput = this.page.getByLabel(
      'Well-known URL of OpenID Provider'
    );
    this.oidcClientIdInput = this.page.getByLabel('Client ID');
    this.oidcClientSecretInput = this.page.getByLabel('Client Secret');
    this.noConnectionsHeader = this.page.getByRole('heading', {
      name: 'No connections found.',
    });
    this.toggleConnectionStatusCheckbox = this.page.getByRole('checkbox', {
      name: 'Active',
    });
    this.toggleConnectionStatusLabel = this.page
      .locator('label')
      .filter({ hasText: 'Active' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
  }

  async goto() {
    await this.page.goto(`/teams/${this.teamSlug}/sso`);
    await expect(this.pageHeader).toBeVisible();
  }

  async checkEmptyConnectionList() {
    await expect(this.noConnectionsHeader).toBeVisible();
  }

  async createSSOConnection({
    metadataUrl,
    type = 'saml',
  }: {
    metadataUrl: string;
    type?: 'saml' | 'oidc';
  }) {
    await this.newConnectionButton.click();
    if (type === 'saml') {
      if (process.env.JACKSON_URL) {
        // fetch the data from metadata url
        const response = await fetch(metadataUrl);
        const data = await response.text();
        await this.metadataRawInput.fill(data);
      } else {
        await this.metadataUrlInput.fill(metadataUrl);
      }
    }
    if (type === 'oidc') {
      // Enter the OIDC client credentials for mocklab in the form
      await this.oidcClientIdInput.fill(MOCKLAB_CLIENT_ID);
      await this.oidcClientSecretInput.fill(MOCKLAB_CLIENT_SECRET);
      // Enter the OIDC discovery url for mocklab in the form
      await this.oidcDiscoveryUrlInput.fill(MOCKLAB_DISCOVERY_ENDPOINT);
    }
    await this.saveButton.click();
    await expect(
      this.page.getByRole('cell', {
        name: type === 'saml' ? 'saml.example.com' : 'oauth.wiremockapi.cloud',
      })
    ).toBeVisible();
  }

  async openEditSSOConnectionView() {
    await this.page.getByLabel('Edit').click();
    await expect(
      this.page.getByRole('heading', {
        name: 'Edit SSO Connection',
      })
    ).toBeVisible();
  }

  async updateSSOConnection({ newStatus }: { newStatus: boolean }) {
    await this.openEditSSOConnectionView();
    await this.toggleConnectionStatus(newStatus);
  }

  async toggleConnectionStatus(newStatus: boolean) {
    const isChecked = await this.toggleConnectionStatusCheckbox.isChecked();
    if (isChecked && !newStatus) {
      await this.toggleConnectionStatusLabel.click();
      await this.confirmButton.click();
    } else if (!isChecked && newStatus) {
      await this.toggleConnectionStatusLabel.click();
      await this.confirmButton.click();
    }
  }

  async deleteSSOConnection() {
    await this.deleteButton.click();
    await expect(
      this.page.getByRole('heading', {
        name: 'Are you sure you want to delete the Connection? This action cannot be undone and will permanently delete the Connection.',
      })
    ).toBeVisible();
    await this.confirmButton.click();
    await expect(
      this.page.getByRole('heading', {
        name: 'Manage SSO Connections',
      })
    ).toBeVisible();
  }
}
