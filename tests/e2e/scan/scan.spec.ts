import { test as base } from '@playwright/test';
import { user, team } from '../support/helper';
import { LoginPage, ScanPage } from '../support/fixtures';

type ScanFixture = {
  loginPage: LoginPage;
  scanPage: ScanPage;
};

const test = base.extend<ScanFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(loginPage);
  },
  scanPage: async ({ page }, use) => {
    const scanPage = new ScanPage(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(scanPage);
  },
});

test('Should scan a website and show results', async ({ loginPage, scanPage }) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await scanPage.goto();
  await scanPage.scan('https://example.com');
  await scanPage.resultsVisible();
});
