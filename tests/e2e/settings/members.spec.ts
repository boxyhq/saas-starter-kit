import { chromium, expect, test } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { signUp, user, team, signIn, loggedInCheck } from '../support/helper';

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

test.afterAll(async () => {
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
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
});
