import { test as base } from '@playwright/test';
import { team, user } from '../support/helper';
import { DirectorySyncPage, LoginPage } from '../support/fixtures';

const DIRECTORY_NAME = 'TestConnection';
const DIRECTORY_NAME_NEW = 'TestConnection1';

type DSyncFixture = {
  loginPage: LoginPage;
  dsyncPage: DirectorySyncPage;
};

const test = base.extend<DSyncFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(loginPage);
  },
  dsyncPage: async ({ page }, use) => {
    const apiKeysPage = new DirectorySyncPage(page, team.slug);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(apiKeysPage);
  },
});

test.beforeEach(async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);
});

test('Should be able to create DSync connection', async ({ dsyncPage }) => {
  await dsyncPage.goto();

  await dsyncPage.checkEmptyConnectionList();

  await dsyncPage.createConnection(DIRECTORY_NAME);

  await dsyncPage.verifyNewConnection(DIRECTORY_NAME);
});

test('Should be able to show existing DSync connections', async ({
  dsyncPage,
}) => {
  await dsyncPage.goto();

  await dsyncPage.verifyListedConnection(DIRECTORY_NAME);
});

test('Should be able to edit the DSync connection', async ({ dsyncPage }) => {
  await dsyncPage.goto();

  await dsyncPage.editConnection(DIRECTORY_NAME_NEW);

  await dsyncPage.goto();

  await dsyncPage.verifyListedConnection(DIRECTORY_NAME_NEW);
});

test('Should be able to disable the DSync connection', async ({
  dsyncPage,
}) => {
  await dsyncPage.goto();

  await dsyncPage.disableConnection();
});

test('Should be able to enable the DSync connection', async ({ dsyncPage }) => {
  await dsyncPage.goto();

  await dsyncPage.enableConnection();
});

test('Should be able to delete the DSync connection', async ({ dsyncPage }) => {
  await dsyncPage.goto();

  await dsyncPage.deleteConnection();
  await dsyncPage.checkEmptyConnectionList();
});
