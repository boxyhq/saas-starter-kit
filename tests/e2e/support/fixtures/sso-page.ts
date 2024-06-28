import { type Page, type Locator, expect } from '@playwright/test';

const MOCKLAB_ORIGIN = 'https://oauth.wiremockapi.cloud';
const MOCKLAB_CLIENT_ID = 'mocklab_oauth2';
const MOCKLAB_CLIENT_SECRET = 'mocklab_secret';
const MOCKLAB_DISCOVERY_ENDPOINT = `${MOCKLAB_ORIGIN}/.well-known/openid-configuration`;

export class SSOPage {
  private readonly pageHeader: Locator;
  private readonly newConnectionButton: Locator;
  private readonly nameInput: Locator;
  private readonly ssoLabelInput: Locator;
  private readonly ssoDescriptionInput: Locator;
  private readonly tenantInput: Locator;
  private readonly redirectURLSInput: Locator;
  private readonly defaultRedirectURLInput: Locator;
  private readonly metadataRawInput: Locator;
  private readonly metadataUrlInput: Locator;
  private readonly oidcIssuerInput: Locator;
  private readonly oidcAuthzInput: Locator;
  private readonly oidcTokenInput: Locator;
  private readonly oidcJwksInput: Locator;
  private readonly oidcUserinfoInput: Locator;
  private readonly oidcDiscoveryUrlInput: Locator;
  private readonly oidcClientIdInput: Locator;
  private readonly oidcClientSecretInput: Locator;
  private readonly saveButton: Locator;
  private readonly deleteButton: Locator;
  private readonly confirmButton: Locator;
  private readonly toggleConnectionStatusCheckbox: Locator;
  private readonly toggleConnectionStatusLabel: Locator;
  private noConnectionsHeader: Locator;
  private productId: string;

  constructor(
    public readonly page: Page,
    public readonly teamSlug: string
  ) {
    this.pageHeader = this.page.getByRole('heading', {
      name: 'Manage SSO Connections',
    });
    this.newConnectionButton = this.page.getByRole('button', {
      name: 'New Connection',
    });
    this.nameInput = this.page.getByLabel('Connection name (Optional)');
    this.ssoLabelInput = this.page.getByLabel('Connection label (Optional)');
    this.ssoDescriptionInput = this.page.getByLabel('Description (Optional)');
    this.tenantInput = this.page.getByLabel('Tenant');
    this.redirectURLSInput = this.page
      .getByRole('group')
      .filter({ hasText: 'Allowed redirect URLs' })
      .locator(page.getByRole('textbox').first());
    this.defaultRedirectURLInput = this.page.getByLabel('Default redirect URL');
    this.metadataUrlInput = this.page.getByPlaceholder(
      'Paste the Metadata URL here'
    );
    this.metadataRawInput = this.page.getByPlaceholder(
      'Paste the raw XML here'
    );
    this.oidcIssuerInput = this.page.getByPlaceholder('https://example.com', {
      exact: true,
    });
    this.oidcAuthzInput = this.page.getByPlaceholder(
      'https://example.com/oauth/authorize'
    );
    this.oidcTokenInput = this.page.getByPlaceholder(
      'https://example.com/oauth/token'
    );
    this.oidcJwksInput = this.page.getByPlaceholder(
      'https://example.com/.well-known/jwks.json'
    );
    this.oidcUserinfoInput = this.page.getByPlaceholder(
      'https://example.com/userinfo'
    );
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
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.deleteButton = this.page.getByRole('button', { name: 'Delete' });
    this.confirmButton = this.page.getByRole('button', { name: 'Confirm' });
    this.productId = '';
  }

  async goto(productId?: string) {
    if (productId) {
      this.productId = productId;
    }
    const url = productId
      ? `/products/${productId}/sso`
      : `/teams/${this.teamSlug}/sso`;
    await this.page.goto(url);
    await expect(this.pageHeader).toBeVisible();
  }

  async checkEmptyConnectionList() {
    await expect(this.noConnectionsHeader).toBeVisible();
  }

  async createSSOConnection({
    metadataUrl,
    oidcMetadata,
    oidcDiscoveryUrl,
    oidcClientId,
    oidcClientSecret,
    provider,
    ssoName,
    tenant,
    type = 'saml',
    index = -1,
  }: {
    metadataUrl?: string;
    oidcMetadata?: {
      issuer: string;
      authorize_endpoint: string;
      token_endpoint: string;
      jwks_uri: string;
      userinfo_endpoint: string;
    };
    oidcDiscoveryUrl?: string;
    oidcClientId?: string;
    oidcClientSecret?: string;
    provider?: string;
    ssoName?: string;
    tenant?: string;
    type?: 'saml' | 'oidc';
    index?: number;
  }) {
    await this.newConnectionButton.click();
    if (type === 'oidc') {
      // Toggle connection type to OIDC
      await this.page.getByLabel('OIDC').check();
    }
    if (this.productId) {
      if (ssoName) {
        await this.nameInput.fill(ssoName);
        await this.ssoLabelInput.fill(`${ssoName}-label`);
        await this.ssoDescriptionInput.fill(`${ssoName}-description`);
      }

      // Fill the tenant for the connection
      await this.tenantInput.fill(tenant!);
      // Fill the Allowed redirect URLs for the connection
      await this.redirectURLSInput.fill('http://localhost:3366');
      // Fill the default redirect URLs for the connection
      await this.defaultRedirectURLInput.fill(
        'http://localhost:3366/login/saml'
      );
    }
    if (type === 'saml') {
      if (process.env.JACKSON_URL) {
        // fetch the data from metadata url
        const response = await fetch(metadataUrl!);
        const data = await response.text();
        await this.metadataRawInput.fill(data);
      } else {
        await this.metadataUrlInput.fill(metadataUrl!);
      }
    }
    if (type === 'oidc') {
      // Enter the OIDC client credentials for mocklab in the form
      await this.oidcClientIdInput.fill(oidcClientId ?? MOCKLAB_CLIENT_ID);
      await this.oidcClientSecretInput.fill(
        oidcClientSecret ?? MOCKLAB_CLIENT_SECRET
      );
      if (oidcDiscoveryUrl || !oidcMetadata) {
        await this.oidcDiscoveryUrlInput.fill(
          oidcDiscoveryUrl ?? MOCKLAB_DISCOVERY_ENDPOINT
        );
      } else if (typeof oidcMetadata === 'object') {
        await this.oidcIssuerInput.fill(oidcMetadata.issuer);
        await this.oidcAuthzInput.fill(oidcMetadata.authorize_endpoint);
        await this.oidcTokenInput.fill(oidcMetadata.token_endpoint);
        await this.oidcJwksInput.fill(oidcMetadata.jwks_uri);
        await this.oidcUserinfoInput.fill(oidcMetadata.userinfo_endpoint);
      }
    }
    await this.saveButton.click();
    const _expectedproviderName =
      provider ??
      (type === 'saml' ? 'saml.example.com' : 'oauth.wiremockapi.cloud');
    if (index > -1) {
      await expect(
        this.page
          .getByRole('cell', {
            name: _expectedproviderName,
          })
          .nth(index)
      ).toBeVisible();
    } else {
      await expect(
        this.page.getByRole('cell', {
          name: _expectedproviderName,
        })
      ).toBeVisible();
    }
  }

  async openEditSSOConnectionView() {
    await this.page.getByLabel('Edit').click();
    await expect(
      this.page.getByRole('heading', {
        name: 'Edit SSO Connection',
      })
    ).toBeVisible();
  }

  async updateSSOConnection({
    url,
    newStatus,
  }: {
    url?: string;
    newStatus?: boolean;
  }) {
    if (url) {
      await this.openEditSSOConnectionView();
      await this.redirectURLSInput.fill(url);
      await this.saveButton.click();
    }
    if (typeof newStatus === 'boolean') {
      await this.openEditSSOConnectionView();
      await this.toggleConnectionStatus(newStatus);
    }
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

  async logout(username: string) {
    await this.page.locator('span').filter({ hasText: username }).focus();
    await this.page.locator('span').filter({ hasText: username }).click();
    await this.page.getByRole('button', { name: 'Sign out' }).click();
  }

  async signInWithSSO(email: string) {
    await this.page.getByRole('link', { name: 'Continue with SSO' }).click();
    await this.page.getByPlaceholder('user@boxyhq.com').fill(email);
    await this.page.getByRole('button', { name: 'Continue with SSO' }).click();
  }
  async signInWithMockSAML(
    mocksamlOrigin: string,
    mocksamlBtnName: string,
    userName: string
  ) {
    // Perform sign in at mocksaml
    await this.page.waitForURL((url) => url.origin === mocksamlOrigin);
    await this.page.getByPlaceholder('jackson').fill(userName);
    await this.page.getByRole('button', { name: mocksamlBtnName }).click();
  }
  async selectIdP(name: string, index: number = -1) {
    await this.page.waitForURL((url) => url.pathname === '/idp/select');
    const idpSelectionTitle = 'Select an Identity Provider to continue';
    await this.page.getByText(idpSelectionTitle).waitFor();
    if (index > -1) {
      await this.page.getByRole('button', { name }).nth(index).click();
    } else {
      await this.page.getByRole('button', { name }).click();
    }
  }

  async signInWithMockLab(name: string, userEmail: string) {
    // Perform sign in at mocklab
    await this.page.waitForURL((url) => url.origin === MOCKLAB_ORIGIN);
    await this.page.getByPlaceholder('yours@example.com').fill(userEmail);
    await this.page.getByRole('button', { name: name }).click();
  }
}
