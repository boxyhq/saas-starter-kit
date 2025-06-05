import { test as base, expect } from '@playwright/test';
import { user, team } from '../support/helper';
import { LoginPage, WebhookPage } from '../support/fixtures';

type WebhookFixture = {
  loginPage: LoginPage;
  webhookPage: WebhookPage;
};

const test = base.extend<WebhookFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  webhookPage: async ({ page }, use) => {
    const webhookPage = new WebhookPage(page, team.slug);
    await use(webhookPage);
  },
});

test.beforeEach(async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);
});

// Verify that insecure webhook URLs are rejected
test('Should not allow webhook creation with http URL', async ({ webhookPage }) => {
  await webhookPage.goto();
  await webhookPage.openCreateModal();
  await webhookPage.fillDescription('Test Webhook');
  await webhookPage.fillEndpoint('http://example.com/webhook');
  await webhookPage.selectFirstEvent();

  const [response] = await Promise.all([
    webhookPage.page.waitForResponse(
      (resp) =>
        resp.url().includes(`/api/teams/${team.slug}/webhooks`) &&
        resp.request().method() === 'POST'
    ),
    webhookPage.submit(),
  ]);

  expect(response.status()).toBe(400);
});
