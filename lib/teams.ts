import {
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  KeyIcon,
  PaperAirplaneIcon,
  ShieldExclamationIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
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
      name: 'Settings',
      href: `/teams/${slug}/settings`,
      active: activeTab === 'settings',
      icon: Cog6ToothIcon,
    },
    {
      name: 'Members',
      href: `/teams/${slug}/members`,
      active: activeTab === 'members',
      icon: UserPlusIcon,
    },
    {
      name: 'SAML SSO',
      href: `/teams/${slug}/saml`,
      active: activeTab === 'saml',
      icon: ShieldExclamationIcon,
    },
    {
      name: 'Directory Sync (SCIM)',
      href: `/teams/${slug}/directory-sync`,
      active: activeTab === 'directory-sync',
      icon: UserPlusIcon,
    },
    {
      name: 'Audit Logs',
      href: `/teams/${slug}/audit-logs`,
      active: activeTab === 'audit-logs',
      icon: DocumentMagnifyingGlassIcon,
    },
    {
      name: 'Webhooks',
      href: `/teams/${slug}/webhooks`,
      active: activeTab === 'webhooks',
      icon: PaperAirplaneIcon,
    },
    {
      name: 'API Keys',
      href: '#',
      active: activeTab === 'api-keys',
      icon: KeyIcon,
    },
  ];
};
