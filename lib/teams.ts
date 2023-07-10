import {
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  KeyIcon,
  PaperAirplaneIcon,
  ShieldExclamationIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { Role, TeamMember } from '@prisma/client';
import useCanAccess from 'hooks/useCanAccess';
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
  //const { canAccess } = useCanAccess();

  const navigations = [
    {
      name: 'Settings',
      href: `/teams/${slug}/settings`,
      active: activeTab === 'settings',
      icon: Cog6ToothIcon,
    },
    // {
    //   name: 'Members',
    //   href: `/teams/${slug}/members`,
    //   active: activeTab === 'members',
    //   icon: UserPlusIcon,
    // },
    // {
    //   name: 'Single Sign-On',
    //   href: `/teams/${slug}/saml`,
    //   active: activeTab === 'saml',
    //   icon: ShieldExclamationIcon,
    // },
    // {
    //   name: 'Directory Sync',
    //   href: `/teams/${slug}/directory-sync`,
    //   active: activeTab === 'directory-sync',
    //   icon: UserPlusIcon,
    // },
    // {
    //   name: 'Audit Logs',
    //   href: `/teams/${slug}/audit-logs`,
    //   active: activeTab === 'audit-logs',
    //   icon: DocumentMagnifyingGlassIcon,
    // },
    // {
    //   name: 'Webhooks',
    //   href: `/teams/${slug}/webhooks`,
    //   active: activeTab === 'webhooks',
    //   icon: PaperAirplaneIcon,
    // },
    // {
    //   name: 'API Keys',
    //   href: `/teams/${slug}/api-keys`,
    //   active: activeTab === 'api-keys',
    //   icon: KeyIcon,
    // },
  ];

  // if(canAccess("teamMembers", ["create", "update", "read", "list", "delete"])) {
  //   navigations.push({
  //     name: 'Members',
  //     href: `/teams/${slug}/members`,
  //     active: activeTab === 'members',
  //     icon: UserPlusIcon,
  //   });
  // }

  return navigations;
};
