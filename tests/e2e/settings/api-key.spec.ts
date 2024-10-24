import { test as base } from '@playwright/test';
import { user, team } from '../support/helper';
import { ApiKeysPage, LoginPage } from '../support/fixtures';

const apiKeyName = 'New Api Key';

type ApiKeyFixture = {
  loginPage: LoginPage;
  apiKeyPage: ApiKeysPage;
};

const test = base.extend<ApiKeyFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(loginPage);
  },
  apiKeyPage: async ({ page }, use) => {
    const apiKeysPage = new ApiKeysPage(page, team.slug);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(apiKeysPage);
  },
});

test.beforeEach(async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);
});

test('Should be able to create new API Key', async ({ apiKeyPage }) => {
  await apiKeyPage.goto();

  await apiKeyPage.createNewApiKey(apiKeyName);

  await apiKeyPage.page.reload();
  await apiKeyPage.apiKeyVisible(apiKeyName);
});

test('Should be able to delete API Key', async ({ apiKeyPage }) => {
  await apiKeyPage.goto();

  await apiKeyPage.apiKeyVisible(apiKeyName);

  await apiKeyPage.revokeApiKey();
  await apiKeyPage.checkNoApiKeys();
});

test('Should not allow to create API Key with empty name', async ({
  apiKeyPage,
}) => {
  await apiKeyPage.goto();

  await apiKeyPage.fillNewApiKeyName('');

  await apiKeyPage.isCreateApiKeyButtonDisabled();
});

test('Should not allow to create API Key with more than 50 characters', async ({
  apiKeyPage,
}) => {
  await apiKeyPage.goto();

  await apiKeyPage.fillNewApiKeyName('a'.repeat(51));

  await apiKeyPage.isCreateApiKeyButtonDisabled();
  await apiKeyPage.isApiKeyNameLengthErrorVisible();
});
