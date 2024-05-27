import { test as base } from '@playwright/test';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';
import { DirectorySyncPage } from '../support/fixtures/directory-sync-page';

const DIRECTORY_NAME = 'TestConnection';
const DIRECTORY_NAME_NEW = 'TestConnection1';

type DSyncFixture = {
  joinPage: JoinPage;
  loginPage: LoginPage;
  dsyncPage: DirectorySyncPage;
};

const test = base.extend<DSyncFixture>({
  joinPage: async ({ page }, use) => {
    const joinPage = new JoinPage(page, user, team.name);
    await joinPage.goto();
    await use(joinPage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  dsyncPage: async ({ page }, use) => {
    const apiKeysPage = new DirectorySyncPage(page, team.slug);
    await use(apiKeysPage);
  },
});

test.afterAll(async () => {
  await cleanup();
});

test('Should be able to create DSync connection', async ({
  joinPage,
  loginPage,
  dsyncPage,
}) => {
  await joinPage.signUp();

  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await dsyncPage.goto();

  await dsyncPage.checkEmptyConnectionList();

  await dsyncPage.createConnection(DIRECTORY_NAME);

  await dsyncPage.verifyNewConnection(DIRECTORY_NAME);
});

test('Should be able to show existing DSync connections', async ({
  loginPage,
  dsyncPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await dsyncPage.goto();

  await dsyncPage.verifyListedConnection(DIRECTORY_NAME);
});

test('Should be able to edit the DSync connection', async ({
  loginPage,
  dsyncPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await dsyncPage.goto();

  await dsyncPage.editConnection(DIRECTORY_NAME_NEW);

  await dsyncPage.goto();

  await dsyncPage.verifyListedConnection(DIRECTORY_NAME_NEW);
});

test('Should be able to disable the DSync connection', async ({
  loginPage,
  dsyncPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await dsyncPage.goto();

  await dsyncPage.disableConnection();
});

test('Should be able to enable the DSync connection', async ({
  loginPage,
  dsyncPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await dsyncPage.goto();

  await dsyncPage.enableConnection();
});

test('Should be able to delete the DSync connection', async ({
  loginPage,
  dsyncPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await dsyncPage.goto();

  await dsyncPage.deleteConnection();
  await dsyncPage.checkEmptyConnectionList();
});
