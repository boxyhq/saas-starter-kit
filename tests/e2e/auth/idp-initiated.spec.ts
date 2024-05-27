import { test as base } from '@playwright/test';
import { user, team, cleanup } from '../support/helper';
import { LoginPage } from '../support/fixtures/login-page';
import { JoinPage } from '../support/fixtures/join-page';
import { SSOPage } from '../support/fixtures/sso-page';

const SSO_METADATA_URL = `${process.env.MOCKSAML_ORIGIN}/api/saml/metadata`;

type IdpInitiatedFixture = {
  loginPage: LoginPage;
  joinPage: JoinPage;
  ssoPage: SSOPage;
};

const test = base.extend<IdpInitiatedFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  joinPage: async ({ page }, use) => {
    const joinPage = new JoinPage(page, user, team.name);
    await joinPage.goto();
    await use(joinPage);
  },
  ssoPage: async ({ page }, use) => {
    const ssoPage = new SSOPage(page, team.slug);
    await use(ssoPage);
  },
});

test.afterAll(async () => {
  await cleanup();
});

test('Sign up and create SSO connection', async ({
  joinPage,
  ssoPage,
  loginPage,
}) => {
  await joinPage.signUp();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await ssoPage.goto();
  await ssoPage.createSSOConnection(SSO_METADATA_URL);

  await loginPage.logout(user.name);
  await loginPage.idpInitiatedLogin();
  await loginPage.loggedInCheck(team.slug);

  await ssoPage.goto();
  await ssoPage.openEditSSOConnectionView();
  await ssoPage.deleteSSOConnection();
});
