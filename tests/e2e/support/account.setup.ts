import { test as base } from '@playwright/test';
import { team, user } from '../support/helper';
import { JoinPage, LoginPage } from './fixtures';

type LoginFixture = {
  loginPage: LoginPage;
  joinPage: JoinPage;
};

const setup = base.extend<LoginFixture>({
  joinPage: async ({ page }, use) => {
    const joinPage = new JoinPage(page, user, team.name);

    await use(joinPage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await use(loginPage);
  },
});

setup('Sign up', async ({ joinPage }) => {
  await joinPage.goto();
  await joinPage.signUp();
});
