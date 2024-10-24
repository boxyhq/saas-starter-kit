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

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(joinPage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(loginPage);
  },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
setup('Sign up', async ({ joinPage, page, loginPage }) => {
  await joinPage.goto();
  await joinPage.signUp();
});
