import { chromium, expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import {
  signUp,
  user,
  team,
  signIn,
  loggedInCheck,
  cleanup,
} from '../support/helper';

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
  await signUp(page, user.name, team.name, user.email, user.password);

  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await page.goto(`/teams/${team.slug}/members`);
  await page.waitForURL(`/teams/${team.slug}/members`);

  await expect(
    await page.getByRole('heading', { name: 'Members' })
  ).toBeVisible();

  await expect(
    page.getByRole('cell', { name: 'J Jackson' }).locator('span')
  ).toBeVisible();

  await expect(
    page.getByRole('cell', { name: 'jackson@example.com' })
  ).toBeVisible();

  await expect(page.getByRole('cell', { name: 'OWNER' })).toBeVisible();
});

test('Should be able to invite a new member', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await page.goto(`/teams/${team.slug}/members`);
  await page.waitForURL(`/teams/${team.slug}/members`);

  await page.getByRole('button', { name: 'Invite Member' }).click();
  await page.waitForSelector('text=Invite New Member');

  await page.getByPlaceholder('jackson@boxyhq.com').fill(invitedUser.email);
  await page.getByRole('button', { name: 'Invite', exact: true }).click();
  await expect(page.getByText('Invitation sent!')).toBeVisible();

  await expect(
    await page.getByRole('heading', { name: 'Members' })
  ).toBeVisible();
  await expect(page.getByText('Pending Invitations')).toBeVisible();

  await expect(
    page.getByRole('cell', { name: `A ${invitedUser.email}` })
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'MEMBER' })).toBeVisible();
});

test('New memeber should be able to accept the invitation', async ({
  page,
}) => {
  const invitation = await prisma.invitation.findFirst({
    where: {
      email: invitedUser.email,
    },
  });
  expect(invitation).not.toBeNull();

  const invitationLink = `${process.env.APP_URL}/invitations/${invitation?.token}`;
  await page.goto(invitationLink);
  await page.waitForURL(invitationLink);

  await expect(
    page.getByRole('heading', { name: 'Example is inviting you to' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Create a new account' }).click();

  await page.getByPlaceholder('Your Name').fill(invitedUser.name);
  await page.getByPlaceholder('Password').fill(invitedUser.password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByText('You have successfully created')).toBeVisible();

  await page.getByPlaceholder('Email').fill(invitedUser.email);
  await page.getByPlaceholder('Password').fill(invitedUser.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByRole('heading', { name: 'Example is inviting you to' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Join the Team' }).click();

  await loggedInCheck(page, team.slug);
});

test('Existing user should be able to accept the invitation', async ({
  page,
}) => {
  await signUp(
    page,
    secondUser.name,
    secondUser.team.name,
    secondUser.email,
    secondUser.password
  );

  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await page.goto(`/teams/${team.slug}/members`);
  await page.waitForURL(`/teams/${team.slug}/members`);

  await page.getByRole('button', { name: 'Invite Member' }).click();
  await page.waitForSelector('text=Invite New Member');

  await page.getByPlaceholder('jackson@boxyhq.com').fill(secondUser.email);
  await page.getByRole('button', { name: 'Invite', exact: true }).click();
  await expect(page.getByText('Invitation sent!')).toBeVisible();

  await expect(
    await page.getByRole('heading', { name: 'Members' })
  ).toBeVisible();
  await expect(page.getByText('Pending Invitations')).toBeVisible();

  await expect(
    page.getByRole('cell', { name: `U ${secondUser.email}` })
  ).toBeVisible();
  await expect(
    (await page.getByRole('cell', { name: 'MEMBER' }).all()).length
  ).toBe(2);

  const invitation = await prisma.invitation.findFirst({
    where: {
      email: secondUser.email,
    },
  });
  expect(invitation).not.toBeNull();

  const invitationLink = `${process.env.APP_URL}/invitations/${invitation?.token}`;

  const browser1 = await chromium.launch();
  const page1 = await browser1.newPage();

  await page1.goto(invitationLink);

  await page1.waitForURL(invitationLink);

  await expect(
    page1.getByRole('heading', { name: 'Example is inviting you to' })
  ).toBeVisible();

  await page1.getByRole('button', { name: 'Log in using an existing' }).click();

  await page1.getByPlaceholder('Email').fill(secondUser.email);
  await page1.getByPlaceholder('Password').fill(secondUser.password);
  await page1.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page1.getByRole('heading', { name: 'Example is inviting you to' })
  ).toBeVisible();

  await page1.getByRole('button', { name: 'Join the Team' }).click();

  await page1.waitForSelector('text=Team Settings');
  await page1.close();
});

test('Should be able to create invite using domain', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await page.goto(`/teams/${team.slug}/members`);
  await page.waitForURL(`/teams/${team.slug}/members`);

  await page.getByRole('button', { name: 'Invite Member' }).click();
  await page.waitForSelector('text=Invite New Member');

  await page
    .getByPlaceholder('Restrict domain: boxyhq.com')
    .fill('example.com');
  await page.getByRole('button', { name: 'Create Link' }).click();

  await expect(page.getByText('Share your team invite link')).toBeVisible();
  domainInviteLink = await page.getByRole('textbox').nth(1).inputValue();

  const browser1 = await chromium.launch();
  const page1 = await browser1.newPage();

  await page1.goto(domainInviteLink);

  await expect(
    page1.getByRole('heading', { name: 'Example is inviting you to' })
  ).toBeVisible();

  await page1.getByRole('button', { name: 'Create a new account' }).click();
  await page1.getByPlaceholder('Your Name').fill(domainUser.name);
  await page1.getByPlaceholder('Email').fill(domainUser.email);
  await page1.getByPlaceholder('Password').fill(domainUser.password);
  await page1.getByRole('button', { name: 'Create Account' }).click();

  await expect(
    await page1.getByText('You have successfully created')
  ).toBeVisible();

  expect(
    await page1.getByText('Welcome back', {
      exact: true,
    })
  ).toBeDefined();

  await page1
    .getByRole('textbox', {
      name: 'Email',
    })
    .click();
  await page1
    .getByRole('textbox', {
      name: 'Email',
    })
    .fill(domainUser.email);
  await page1.getByPlaceholder('Password').fill(domainUser.password);
  await page1.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page1.getByRole('heading', { name: 'Example is inviting you to' })
  ).toBeVisible();

  await page1.getByRole('button', { name: 'Join the Team' }).click();

  await page1.waitForSelector('text=Team Settings');
  await page1.close();
});

test('Should not allow to invite a member with invalid domain', async ({
  page,
}) => {
  await page.goto(domainInviteLink);

  await expect(
    page.getByRole('heading', { name: 'Example is inviting you to' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Create a new account' }).click();
  await page.getByPlaceholder('Your Name').fill(invalidDomainUser.name);
  await page.getByPlaceholder('Email').fill(invalidDomainUser.email);
  await page.getByPlaceholder('Password').fill(invalidDomainUser.password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByText('You have successfully created')).toBeVisible();

  await page.getByPlaceholder('Email').fill(invalidDomainUser.email);
  await page.getByPlaceholder('Password').fill(invalidDomainUser.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByRole('heading', { name: 'Example is inviting you to' })
  ).toBeVisible();

  await expect(
    page.getByText(
      `Your email address domain ${invalidDomainUser.email.split('@')[1]} is not allowed`
    )
  ).toBeVisible();
});

test('Should be able to remove a member', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await page.goto(`/teams/${team.slug}/members`);
  await page.waitForURL(`/teams/${team.slug}/members`);

  await expect(
    await page.getByRole('heading', { name: 'Members' })
  ).toBeVisible();

  await page.getByRole('cell', { name: 'Remove' }).first().click();
  await page.waitForSelector('text=Confirm deletion of member');
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Member deleted successfully.')).toBeVisible();
});

test('Should not allow invalid email to be invited', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await page.goto(`/teams/${team.slug}/members`);
  await page.waitForURL(`/teams/${team.slug}/members`);

  await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible();
  await page.getByRole('button', { name: 'Invite Member' }).click();
  await expect(
    page.getByRole('heading', { name: 'Invite New Member' })
  ).toBeVisible();

  await page
    .getByPlaceholder('jackson@boxyhq.com')
    .fill('aaaaaaaaaaaaaaaaaaaa@.com');

  await expect(
    await page.getByRole('button', { name: 'Invite', exact: true }).isDisabled()
  ).toBeTruthy();
});

test('Should not allow email with invalid length', async ({ page }) => {
  await signIn(page, user.email, user.password);

  await loggedInCheck(page, team.slug);

  await page.goto(`/teams/${team.slug}/members`);
  await page.waitForURL(`/teams/${team.slug}/members`);

  await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible();
  await page.getByRole('button', { name: 'Invite Member' }).click();
  await expect(
    page.getByRole('heading', { name: 'Invite New Member' })
  ).toBeVisible();

  await page
    .getByPlaceholder('jackson@boxyhq.com')
    .fill('a'.repeat(256) + '@boxyhq.com');

  await expect(
    await page.getByRole('button', { name: 'Invite', exact: true }).isDisabled()
  ).toBeTruthy();
});
