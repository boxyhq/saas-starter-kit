import { test as base } from '@playwright/test';
import { user, team } from '../support/helper';
import { JoinPage, LoginPage, SettingsPage } from '../support/fixtures';
import { prisma } from '@/lib/prisma';

const teamNewInfo = {
  name: 'New Team Name',
  slug: 'new team example',
  sluggified: 'new-team-example',
} as const;

type TeamSettingsFixture = {
  loginPage: LoginPage;
  joinPage: JoinPage;
  settingsPage: SettingsPage;
};

const test = base.extend<TeamSettingsFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(loginPage);
  },
  joinPage: async ({ page }, use) => {
    const joinPage = new JoinPage(page, user, team.name);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(joinPage);
  },
  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page, team.slug);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(settingsPage);
  },
});

test.afterAll(async () => {
  await prisma.team.update({
    where: { slug: teamNewInfo.sluggified },
    data: { name: team.name, slug: team.slug },
  });
});

test('Should be able to update team name', async ({
  loginPage,
  settingsPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await settingsPage.goto(team.slug);
  await settingsPage.updateTeamName(teamNewInfo.name);

  await settingsPage.page.reload();
  await settingsPage.isSettingsPageVisible();
  await settingsPage.checkTeamName(teamNewInfo.name);
});

test('Should not allow to update team name with empty value', async ({
  loginPage,
  settingsPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await settingsPage.goto(team.slug);
  await settingsPage.fillTeamName('');
  await settingsPage.isSaveButtonDisabled();
});

test('Should not allow to update team name with more than 50 characters', async ({
  loginPage,
  settingsPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await settingsPage.goto(team.slug);
  await settingsPage.fillTeamName('a'.repeat(51));
  await settingsPage.isSaveButtonDisabled();
  await settingsPage.isTeamNameLengthErrorVisible();
});

test('Should be able to update team slug', async ({
  loginPage,
  settingsPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await settingsPage.goto(team.slug);
  await settingsPage.updateTeamSlug(teamNewInfo.slug);

  await settingsPage.page.reload();
  await settingsPage.isSettingsPageVisible();
  await settingsPage.checkTeamSlug(teamNewInfo.sluggified);
});

test('Should not allow empty slug', async ({ loginPage, settingsPage }) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  await settingsPage.goto(teamNewInfo.sluggified);
  await settingsPage.fillTeamSlug('');
  await settingsPage.isSaveButtonDisabled();
});

test('Should not allow to update team slug with more than 50 characters', async ({
  loginPage,
  settingsPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  await settingsPage.goto(teamNewInfo.sluggified);
  await settingsPage.fillTeamSlug('a'.repeat(51));
  await settingsPage.isSaveButtonDisabled();
  await settingsPage.isTeamSlugLengthErrorVisible();
});

test('Should be able to set domain in team settings', async ({
  loginPage,
  settingsPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  await settingsPage.goto(teamNewInfo.sluggified);
  await settingsPage.updateDomain('example.com');
  await settingsPage.page.reload();
  await settingsPage.isSettingsPageVisible();
  await settingsPage.checkDomain('example.com');
});

test('Should not allow to set domain with more than 253 characters', async ({
  loginPage,
  settingsPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  await settingsPage.goto(teamNewInfo.sluggified);
  await settingsPage.fillDomain('a'.repeat(256) + '.com');
  await settingsPage.isSaveButtonDisabled();
  await settingsPage.isDomainLengthErrorVisible();
});

test('Should not allow to set invalid domain', async ({
  loginPage,
  settingsPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(teamNewInfo.sluggified);

  await settingsPage.goto(teamNewInfo.sluggified);
  await settingsPage.fillDomain('example');
  await settingsPage.isSaveButtonDisabled();
  await settingsPage.isDomainInvalidErrorVisible();
});
