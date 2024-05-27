import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class LoginPage {
  private readonly IDP_LOGIN_URL: string;
  private readonly ACS_URL: string;

  private readonly emailBox: Locator;
  private readonly passwordBox: Locator;
  private readonly signInButton: Locator;
  private readonly continueWithSSOButton: Locator;
  private readonly continueWithSSOLink: Locator;
  private readonly ssoEmailBox: Locator;
  private readonly slugInput: Locator;
  private readonly welcomeBackHeading: Locator;
  private readonly multipleTeamErrorText: Locator;
  private readonly createNewAccountButton: Locator;
  private readonly yourNameInput: Locator;
  private readonly yourEmailInput: Locator;
  private readonly yourPasswordInput: Locator;
  private readonly createAccountButton: Locator;
  private readonly successfullyCreatedText: Locator;
  private readonly logInUsingExistingButton: Locator;
  private readonly idpSignInButton: Locator;
  private readonly joinTeamButton: Locator;

  constructor(public readonly page: Page) {
    this.IDP_LOGIN_URL = `${process.env.MOCKSAML_ORIGIN}/saml/login`;
    this.ACS_URL = `${process.env.APP_URL}/api/oauth/saml`;

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
    this.welcomeBackHeading = this.page.getByText('Welcome back', {
      exact: true,
    });
    this.multipleTeamErrorText = this.page.getByText(
      'User belongs to multiple'
    );
    this.createNewAccountButton = this.page.getByRole('button', {
      name: 'Create a new account',
    });
    this.yourNameInput = this.page.getByPlaceholder('Your Name');
    this.yourEmailInput = this.page.getByPlaceholder('Email');
    this.yourPasswordInput = this.page.getByPlaceholder('Password');
    this.createAccountButton = this.page.getByRole('button', {
      name: 'Create Account',
    });
    this.successfullyCreatedText = this.page.getByText(
      'You have successfully created'
    );
    this.logInUsingExistingButton = this.page.getByRole('button', {
      name: 'Log in using an existing',
    });
    this.idpSignInButton = this.page.getByRole('button', {
      name: 'Sign In',
    });
    this.joinTeamButton = this.page.getByRole('button', {
      name: 'Join the Team',
    });
  }

  async goto() {
    await this.page.goto('/auth/login');
    await this.page.waitForURL('/auth/login');
  }

  async isMultipleTeamErrorVisible() {
    await expect(this.multipleTeamErrorText).toBeVisible();
  }

  async loggedInCheck(teamSlug: string) {
    await this.page.waitForURL(`/teams/${teamSlug}/settings`);
    await this.page.waitForSelector('text=Team Settings');
  }

  async credentialLogin(email: string, password: string) {
    await expect(this.welcomeBackHeading).toBeVisible();
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
    await this.idpSignInButton.click();
  }

  async logout(name: string) {
    await this.page.locator('button').filter({ hasText: name }).click();
    await this.page.getByRole('button', { name: 'Sign out' }).click();
    await expect(this.welcomeBackHeading).toBeVisible();
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
    await expect(this.invitationMessage(invitingCompany)).toBeVisible();
  }

  private invitationMessage(invitingCompany: string): Locator {
    return this.page.getByRole('heading', {
      name: `${invitingCompany} is inviting you to`,
    });
  }

  public async acceptInvitation() {
    await this.joinTeamButton.click();
    await this.page.waitForSelector('text=Team Settings');
  }

  async createNewAccountViaInvite(name: string, password: string) {
    await this.createNewAccountButton.click();
    await this.yourNameInput.fill(name);
    await this.yourPasswordInput.fill(password);
    await this.createAccountButton.click();
    await expect(this.successfullyCreatedText).toBeVisible();
  }

  async createNewAccountViaInviteLink(
    name: string,
    email: string,
    password: string,
    invitingCompany: string
  ) {
    await expect(this.invitationMessage(invitingCompany)).toBeVisible();

    await this.createNewAccountButton.click();
    await this.yourNameInput.fill(name);
    await this.yourEmailInput.fill(email);
    await this.yourPasswordInput.fill(password);
    await this.createAccountButton.click();
    await expect(this.successfullyCreatedText).toBeVisible();
  }

  async acceptInvitationWithExistingAccount(email: string, password: string) {
    await this.logInUsingExistingButton.click();
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
