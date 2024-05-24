import { chromium, expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { user, team, cleanup } from '../support/helper';
import { JoinPage } from '../support/fixtures/join-page';
import { LoginPage } from '../support/fixtures/login-page';
import { MemberPage } from '../support/fixtures/member-page';

let domainInviteLink = '';

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

test.afterAll(async () => {
  await cleanup();
});

test('Should be able to get the list of members', async ({ page }) => {
  const joinPage = new JoinPage(page, user, team.name);
  await joinPage.goto();
  await joinPage.signUp();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const memberPage = new MemberPage(page, team.slug);
  await memberPage.goto();
  await memberPage.teamMemberExists(user.name, user.email, 'OWNER');
});

test('Should be able to invite a new member', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const memberPage = new MemberPage(page, team.slug);
  await memberPage.goto();
  await memberPage.inviteByEmail(invitedUser.email);
  await memberPage.membersPageVisible();
  await memberPage.checkPendingInvitation(invitedUser.email, 'MEMBER');
});

test('New memeber should be able to accept the invitation', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
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
  page,
}) => {
  const joinPage = new JoinPage(page, secondUser, secondUser.team.name);
  await joinPage.goto();
  await joinPage.signUp();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const memberPage = new MemberPage(page, team.slug);
  await memberPage.goto();

  await memberPage.inviteByEmail(secondUser.email);

  await memberPage.pendingMemberVisible();

  await expect(
    page.getByRole('cell', { name: `U ${secondUser.email}` })
  ).toBeVisible();
  await expect(
    (await page.getByRole('cell', { name: 'MEMBER' }).all()).length
  ).toBe(2);

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

test('Should be able to create invite using domain', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const memberPage = new MemberPage(page, team.slug);
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
  page,
}) => {
  const loginPage = new LoginPage(page);
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

test('Should be able to remove a member', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const memberPage = new MemberPage(page, team.slug);
  await memberPage.goto();

  await memberPage.removeMember();
});

test('Should not allow invalid email to be invited', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const memberPage = new MemberPage(page, team.slug);
  await memberPage.goto();

  await memberPage.openInviteModal();

  await memberPage.fillEmailForInvite('aaaaaaaaaaaaaaaaaaaa@.com');

  await memberPage.isInviteButtonDisabled();
});

test('Should not allow email with invalid length', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);

  const memberPage = new MemberPage(page, team.slug);
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
