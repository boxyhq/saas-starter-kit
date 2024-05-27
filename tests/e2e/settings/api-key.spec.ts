import { test as base } from '@playwright/test';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';
import { ApiKeysPage } from '../support/fixtures/api-keys-page';

const apiKeyName = 'New Api Key';

type ApiKeyFixture = {
  joinPage: JoinPage;
  loginPage: LoginPage;
  apiKeyPage: ApiKeysPage;
};

const test = base.extend<ApiKeyFixture>({
  joinPage: async ({ page }, use) => {
    const joinPage = new JoinPage(page, user, team.name);
    await joinPage.goto();
    await use(joinPage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  apiKeyPage: async ({ page }, use) => {
    const apiKeysPage = new ApiKeysPage(page, team.slug);
    await use(apiKeysPage);
  },
});

test.afterAll(async () => {
  await cleanup();
});

test('Should be able to create new API Key', async ({
  joinPage,
  loginPage,
  apiKeyPage,
}) => {
  await joinPage.goto();
  await joinPage.signUp();

  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await apiKeyPage.goto();

  await apiKeyPage.createNewApiKey(apiKeyName);

  await apiKeyPage.page.reload();
  await apiKeyPage.apiKeyVisible(apiKeyName);
});

test('Should be able to delete API Key', async ({ loginPage, apiKeyPage }) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await apiKeyPage.goto();

  await apiKeyPage.apiKeyVisible(apiKeyName);

  await apiKeyPage.revokeApiKey();
  await apiKeyPage.checkNoApiKeys();
});

test('Should not allow to create API Key with empty name', async ({
  loginPage,
  apiKeyPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await apiKeyPage.goto();

  await apiKeyPage.fillNewApiKeyName('');

  await apiKeyPage.isCreateApiKeyButtonDisabled();
});

test('Should not allow to create API Key with more than 50 characters', async ({
  loginPage,
  apiKeyPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await apiKeyPage.goto();

  await apiKeyPage.fillNewApiKeyName('a'.repeat(51));

  await apiKeyPage.isCreateApiKeyButtonDisabled();
  await apiKeyPage.isApiKeyNameLengthErrorVisible();
});
