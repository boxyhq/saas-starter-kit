import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class MemberPage {
  constructor(
    public readonly page: Page,
    public readonly teamSlug: string
  ) {}

  async goto() {
    await this.page.goto(`/teams/${this.teamSlug}/members`);
    await this.page.waitForURL(`/teams/${this.teamSlug}/members`);
    await this.membersPageVisible();
  }

  async membersPageVisible() {
    await expect(
      await this.page.getByRole('heading', { name: 'Members' })
    ).toBeVisible();
  }

  async teamMemberExists(
    name: string,
    email: string,
    role: 'OWNER' | 'MEMBER'
  ) {
    await expect(
      this.page
        .getByRole('cell', { name: `${name.charAt(0).toUpperCase()} ${name}` })
        .locator('span')
    ).toBeVisible();

    await expect(this.page.getByRole('cell', { name: email })).toBeVisible();

    await expect(this.page.getByRole('cell', { name: role })).toBeVisible();
  }

  async openInviteModal() {
    await this.page.getByRole('button', { name: 'Invite Member' }).click();
    await this.page.waitForSelector('text=Invite New Member');
  }

  async fillEmailForInvite(email: string) {
    await this.page.getByPlaceholder('jackson@boxyhq.com').fill(email);
  }

  async clickInviteButton() {
    await this.page
      .getByRole('button', { name: 'Invite', exact: true })
      .click();
  }

  async isInviteButtonDisabled() {
    await expect(
      await this.page
        .getByRole('button', { name: 'Invite', exact: true })
        .isDisabled()
    ).toBeTruthy();
  }

  async inviteByEmail(email: string) {
    await this.openInviteModal();
    await this.fillEmailForInvite(email);
    await this.clickInviteButton();
    await expect(this.page.getByText('Invitation sent!')).toBeVisible();
  }

  async checkPendingInvitation(email: string, role: 'MEMBER' | 'OWNER') {
    await this.pendingMemberVisible();

    await expect(
      this.page.getByRole('cell', {
        name: `${email.charAt(0).toUpperCase()} ${email}`,
      })
    ).toBeVisible();
    await expect(this.page.getByRole('cell', { name: role })).toBeVisible();
  }

  public async pendingMemberVisible() {
    await expect(this.page.getByText('Pending Invitations')).toBeVisible();
  }

  public async createInviteLink(domain: string) {
    await this.openInviteModal();

    await this.page
      .getByPlaceholder('Restrict domain: boxyhq.com')
      .fill(domain);
    await this.page.getByRole('button', { name: 'Create Link' }).click();

    await expect(
      this.page.getByText('Share your team invite link')
    ).toBeVisible();
    const domainInviteLink = await this.page
      .getByRole('textbox')
      .nth(1)
      .inputValue();
    return domainInviteLink;
  }

  public async removeMember() {
    await this.page.getByRole('cell', { name: 'Remove' }).first().click();
    await this.page.waitForSelector('text=Confirm deletion of member');
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await expect(
      this.page.getByText('Member deleted successfully.')
    ).toBeVisible();
  }
}
