import type { User } from "next-auth";

import type { TeamMember } from "@prisma/client";

export const isTeamOwner = (user: User, members: TeamMember[]) => {
  const owner = members.filter(
    (member) => member.userId === user.id && member.role === "owner"
  );

  return owner.length > 0;
};

export const teamNavigations = (slug: string, activeTab: string) => {
  return [
    {
      name: "Members",
      href: `/teams/${slug}/members`,
      active: activeTab === "members",
    },
    {
      name: "Settings",
      href: `/teams/${slug}/settings`,
      active: activeTab === "settings",
    },
    {
      name: "SAML SSO",
      href: `/teams/${slug}/saml`,
      active: activeTab === "saml",
    },
    {
      name: "Directory Sync (SCIM)",
      href: `/teams/${slug}/directory-sync`,
      active: activeTab === "directory-sync",
    },
    {
      name: "Audit Logs",
      href: `/teams/${slug}/audit-logs`,
      active: activeTab === "audit-logs",
    },
    {
      name: "Webhooks",
      href: `/teams/${slug}/webhooks`,
      active: activeTab === "webhooks",
    },
  ];
};
