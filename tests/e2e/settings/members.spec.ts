import { chromium, expect, test as base } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { user, team } from '../support/helper';
import { JoinPage, LoginPage, MemberPage } from '../support/fixtures';
import { testRole } from '../support/fixtures/consts';

let domainInviteLink = '';

type MemberFixture = {
  loginPage: LoginPage;
  memberPage: MemberPage;
  secondUserJoinPage: JoinPage;
};

const test = base.extend<MemberFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(loginPage);
  },
  memberPage: async ({ page }, use) => {
    const apiKeysPage = new MemberPage(page, team.slug);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(apiKeysPage);
  },
  secondUserJoinPage: async ({ page }, use) => {
    const joinPage = new JoinPage(page, secondUser, secondUser.team.name);
    await joinPage.goto();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(joinPage);
  },
});

const invitedUser = {
  name: 'Admin',
  email: 'admin@example.com',
  password: 'admin@123',
};

const secondUser = {
  name: 'User',
  email: 'user@example.com',
  password: 'user@123',
  team: {
    name: 'Second Team',
    slug: 'second-team',
  },
};

const domainUser = {
  name: 'DomainUser',
  email: 'domain@example.com',
  password: 'domain@123',
};

const invalidDomainUser = {
  name: 'InvalidDomainUser',
  email: 'user@invalid.com',
  password: 'password',
};

test('Should be able to get the list of members', async ({
  loginPage,
  memberPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await memberPage.goto();
  await memberPage.teamMemberExists(user.name, user.email, 'OWNER');
});

test('Should be able to invite a new member', async ({
  loginPage,
  memberPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await memberPage.goto();
  await memberPage.inviteByEmail(invitedUser.email);
  await memberPage.membersPageVisible();
  await memberPage.checkPendingInvitation(invitedUser.email, testRole);
});

test('New member should be able to accept the invitation', async ({
  loginPage,
}) => {
  const invitation = await getAndVerifyInvitation(invitedUser.email);
  const invitationLink = `${process.env.APP_URL}/invitations/${invitation?.token}`;
  await loginPage.gotoInviteLink(invitationLink, team.name);
  await loginPage.createNewAccountViaInvite(
    invitedUser.name,
    invitedUser.password
  );

  await loginPage.credentialLogin(invitedUser.email, invitedUser.password);
  await loginPage.invitationAcceptPromptVisible(team.name);
  await loginPage.acceptInvitation();
});

test('Existing user should be able to accept the invitation', async ({
  secondUserJoinPage,
  loginPage,
  memberPage,
  page,
}) => {
  await secondUserJoinPage.signUp();

  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await memberPage.goto();

  await memberPage.inviteByEmail(secondUser.email);

  await memberPage.pendingMemberVisible();

  await expect(
    page.getByRole('cell', { name: `U ${secondUser.email}` })
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: testRole, exact: true })
  ).toHaveCount(2);

  const invitation = await getAndVerifyInvitation(secondUser.email);

  const invitationLink = `${process.env.APP_URL}/invitations/${invitation?.token}`;

  const browser1 = await chromium.launch();
  const page1 = await browser1.newPage();

  const loginPage1 = new LoginPage(page1);
  await loginPage1.gotoInviteLink(invitationLink, team.name);

  await loginPage1.acceptInvitationWithExistingAccount(
    secondUser.email,
    secondUser.password
  );

  await loginPage1.invitationAcceptPromptVisible(team.name);

  await loginPage1.acceptInvitation();
  await page1.close();
});

test('Should be able to create invite using domain', async ({
  loginPage,
  memberPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await memberPage.goto();

  domainInviteLink = await memberPage.createInviteLink('example.com');

  const browser1 = await chromium.launch();
  const page1 = await browser1.newPage();

  const loginPage1 = new LoginPage(page1);
  await loginPage1.gotoInviteLink(domainInviteLink, team.name);
  await loginPage1.createNewAccountViaInviteLink(
    domainUser.name,
    domainUser.email,
    domainUser.password,
    team.name
  );

  await loginPage1.credentialLogin(domainUser.email, domainUser.password);

  await loginPage1.invitationAcceptPromptVisible(team.name);
  await loginPage1.acceptInvitation();
  await page1.close();
});

test('Should not allow to invite a member with invalid domain', async ({
  loginPage,
}) => {
  await loginPage.gotoInviteLink(domainInviteLink, team.name);
  await loginPage.createNewAccountViaInviteLink(
    invalidDomainUser.name,
    invalidDomainUser.email,
    invalidDomainUser.password,
    team.name
  );
  await loginPage.credentialLogin(
    invalidDomainUser.email,
    invalidDomainUser.password
  );
  await loginPage.invitationAcceptPromptVisible(team.name);
  await loginPage.invalidDomainErrorVisible(invalidDomainUser.email);
});

test('Should be able to remove a member', async ({ loginPage, memberPage }) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await memberPage.goto();
  await memberPage.removeMember();
});

test('Should not allow invalid email to be invited', async ({
  loginPage,
  memberPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await memberPage.goto();
  await memberPage.openInviteModal();
  await memberPage.fillEmailForInvite('aaaaaaaaaaaaaaaaaaaa@.com');
  await memberPage.isInviteButtonDisabled();
});

test('Should not allow email with invalid length', async ({
  loginPage,
  memberPage,
}) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  await memberPage.goto();

  await memberPage.openInviteModal();

  await memberPage.fillEmailForInvite('a'.repeat(256) + '@boxyhq.com');

  await memberPage.isInviteButtonDisabled();
});

async function getAndVerifyInvitation(email: string) {
  const invitation = await prisma.invitation.findFirst({
    where: {
      email: email,
    },
  });
  expect(invitation).not.toBeNull();
  return invitation;
}
