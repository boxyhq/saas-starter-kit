import { Role, TeamMember } from '@prisma/client';
import type { User } from 'next-auth';

export const isTeamAdmin = (user: User, members: TeamMember[]) => {
  return (
    members.filter(
      (member) =>
        member.userId === user.id &&
        (member.role === Role.ADMIN || member.role === Role.OWNER)
    ).length > 0
  );
};

export const teamNavigations = (slug: string, activeTab: string) => {
  return [
    {
      name: 'Members',
      href: `/teams/${slug}/members`,
      active: activeTab === 'members',
    },
    {
      name: 'Settings',
      href: `/teams/${slug}/settings`,
      active: activeTab === 'settings',
    },
    {
      name: 'SAML SSO',
      href: `/teams/${slug}/saml`,
      active: activeTab === 'saml',
    },
    {
      name: 'Directory Sync (SCIM)',
      href: `/teams/${slug}/directory-sync`,
      active: activeTab === 'directory-sync',
    },
    {
      name: 'Audit Logs',
      href: `/teams/${slug}/audit-logs`,
      active: activeTab === 'audit-logs',
    },
    {
      name: 'Webhooks',
      href: `/teams/${slug}/webhooks`,
      active: activeTab === 'webhooks',
    },
  ];
};
