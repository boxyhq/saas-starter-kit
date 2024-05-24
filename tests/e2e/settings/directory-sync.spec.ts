import { expect, test } from '@playwright/test';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';
import { DirectorySyncPage } from '../support/fixtures/directory-sync-page';

const DIRECTORY_NAME = 'TestConnection';
const DIRECTORY_NAME_NEW = 'TestConnection1';

test.afterAll(async () => {
  await cleanup();
});

test('Should be able to create DSync connection', async ({ page }) => {
  const joinPage = new JoinPage(page, user, team.name);
  await joinPage.goto();
  await joinPage.signUp();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const dsyncPage = new DirectorySyncPage(page, team.slug);
  await dsyncPage.goto();

  await dsyncPage.checkEmptyConnectionList();

  await dsyncPage.createConnection(DIRECTORY_NAME);

  await dsyncPage.verifyNewConnection(DIRECTORY_NAME);
});

test('Should be able to show existing DSync connections', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const dsyncPage = new DirectorySyncPage(page, team.slug);
  await dsyncPage.goto();

  await dsyncPage.verifyListedConnection(DIRECTORY_NAME);
});

test('Should be able to edit the DSync connection', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const dsyncPage = new DirectorySyncPage(page, team.slug);
  await dsyncPage.goto();

  await dsyncPage.editConnection(DIRECTORY_NAME_NEW);

  await dsyncPage.goto();

  await dsyncPage.verifyListedConnection(DIRECTORY_NAME_NEW);
});

test('Should be able to disable the DSync connection', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const dsyncPage = new DirectorySyncPage(page, team.slug);
  await dsyncPage.goto();

  await dsyncPage.disableConnection();
});

test('Should be able to enable the DSync connection', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const dsyncPage = new DirectorySyncPage(page, team.slug);
  await dsyncPage.goto();

  await dsyncPage.enableConnection();
});

test('Should be able to delete the DSync connection', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const dsyncPage = new DirectorySyncPage(page, team.slug);
  await dsyncPage.goto();

  await dsyncPage.deleteConnection();
  await dsyncPage.checkEmptyConnectionList();
});
