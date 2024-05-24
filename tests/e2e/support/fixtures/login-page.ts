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
  private readonly slugInput: Locator;

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
    this.slugInput = this.page.getByPlaceholder('boxyhq');
  }

  async goto() {
    await this.page.goto('/auth/login');
    await this.page.waitForURL('/auth/login');
  }

  async isMultipleTeamErrorVisible() {
    await expect(this.page.getByText('User belongs to multiple')).toBeVisible();
  }

  async loggedInCheck(teamSlug: string) {
    await this.page.waitForURL(`/teams/${teamSlug}/settings`);
    await this.page.waitForSelector('text=Team Settings');
  }

  async credentialLogin(email: string, password: string) {
    await expect(
      this.page.getByRole('heading', { name: 'Welcome back' })
    ).toBeVisible();
    await this.emailBox.focus();
    await this.emailBox.fill(email);
    await this.passwordBox.fill(password);
    await this.signInButton.click();
  }

  async ssoLogin(email: string, errorCase = false) {
    await this.continueWithSSOLink.click();
    await this.page.waitForSelector('text=Sign in with SAML SSO');
    await this.ssoEmailBox.fill(email);
    await this.continueWithSSOButton.click();
    if (!errorCase) {
      await this.page.waitForSelector('text=SAML SSO Login');
      await this.signInButton.click();
    }
  }

  async ssoLoginWithSlug(teamSlug: string) {
    await this.slugInput.fill(teamSlug);
    await this.continueWithSSOButton.click();
    await this.page.waitForSelector('text=SAML SSO Login');
    await this.signInButton.click();
    await this.page.waitForSelector('text=Team Settings');
  }

  async idpInitiatedLogin() {
    await this.page.goto(this.IDP_LOGIN_URL);
    await this.page
      .getByPlaceholder('https://sso.eu.boxyhq.com/api')
      .fill(this.ACS_URL);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async logout(name: string) {
    await this.page.locator('button').filter({ hasText: name }).click();
    await this.page.getByRole('button', { name: 'Sign out' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Welcome back' })
    ).toBeVisible();
  }

  async isLoggedOut() {
    expect(
      await this.page.getByText('Welcome back', {
        exact: true,
      })
    ).toBeDefined();
  }

  async gotoInviteLink(invitationLink: string, invitingCompany: string) {
    await this.page.goto(invitationLink);
    await this.page.waitForURL(invitationLink);

    await this.invitationAcceptPromptVisible(invitingCompany);
  }

  public async invitationAcceptPromptVisible(invitingCompany: string) {
    await expect(
      this.page.getByRole('heading', {
        name: `${invitingCompany} is inviting you to`,
      })
    ).toBeVisible();
  }

  public async acceptInvitation() {
    await this.page.getByRole('button', { name: 'Join the Team' }).click();
    await this.page.waitForSelector('text=Team Settings');
  }

  async createNewAccountViaInvite(name: string, password: string) {
    await this.page
      .getByRole('button', { name: 'Create a new account' })
      .click();

    await this.page.getByPlaceholder('Your Name').fill(name);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Create Account' }).click();

    await expect(
      this.page.getByText('You have successfully created')
    ).toBeVisible();
  }

  async createNewAccountViaInviteLink(
    name: string,
    email: string,
    password: string,
    invitingCompany: string
  ) {
    await expect(
      this.page.getByRole('heading', {
        name: `${invitingCompany} is inviting you to`,
      })
    ).toBeVisible();

    await this.page
      .getByRole('button', { name: 'Create a new account' })
      .click();
    await this.page.getByPlaceholder('Your Name').fill(name);
    await this.page.getByPlaceholder('Email').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Create Account' }).click();

    await expect(
      await this.page.getByText('You have successfully created')
    ).toBeVisible();
  }

  async acceptInvitationWithExistingAccount(email: string, password: string) {
    await this.page
      .getByRole('button', { name: 'Log in using an existing' })
      .click();
    await this.credentialLogin(email, password);
  }

  async invalidDomainErrorVisible(email: string) {
    await expect(
      this.page.getByText(
        `Your email address domain ${email.split('@')[1]} is not allowed`
      )
    ).toBeVisible();
  }
}
