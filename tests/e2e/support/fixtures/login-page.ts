import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class LoginPage {
  private readonly IDP_LOGIN_URL = `${process.env.MOCKSAML_ORIGIN}/saml/login`;
  private readonly ACS_URL = `${process.env.APP_URL}/api/oauth/saml`;
  private readonly emailBox: Locator;
  private readonly passwordBox: Locator;
  private readonly signInButton: Locator;
  private readonly continueWithSSOButton: Locator;
  private readonly continueWithSSOLink: Locator;
  private readonly ssoEmailBox: Locator;

  constructor(public readonly page: Page) {
    this.emailBox = this.page.getByPlaceholder('Email');
    this.passwordBox = this.page.getByPlaceholder('Password');
    this.signInButton = this.page.getByRole('button', { name: 'Sign in' });
    this.continueWithSSOButton = this.page.getByRole('button', {
      name: 'Continue with SSO',
    });
    this.continueWithSSOLink = this.page.getByRole('link', {
      name: 'Continue with SSO',
    });
    this.ssoEmailBox = this.page.getByPlaceholder('user@boxyhq.com');
  }

  async goto() {
    await this.page.goto('/auth/login');
    await this.page.waitForURL('/auth/login');
  }

  async loggedInCheck(teamSlug: string) {
    await this.page.waitForURL(`/teams/${teamSlug}/settings`);
    await this.page.waitForSelector('text=Team Settings');
  }

  async credentialLogin(email: string, password: string) {
    await expect(
      this.page.getByRole('heading', { name: 'Welcome back' })
    ).toBeVisible();
    await this.emailBox.fill(email);
    await this.passwordBox.fill(password);
    await this.signInButton.click();
  }

  async ssoLogin(email: string) {
    await this.continueWithSSOLink.click();
    await this.page.waitForSelector('text=Sign in with SAML SSO');
    await this.ssoEmailBox.fill(email);
    await this.continueWithSSOButton.click();
    await this.page.waitForSelector('text=SAML SSO Login');
    await this.signInButton.click();
  }

  async idpInitiatedLogin() {
    await this.page.goto(this.IDP_LOGIN_URL);
    await this.page
      .getByPlaceholder('https://sso.eu.boxyhq.com/api')
      .fill(this.ACS_URL);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }
}
