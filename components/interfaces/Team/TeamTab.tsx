import Link from "next/link";
import classNames from "classnames";

import type { Team } from "@prisma/client";

const TeamTab = (props: { activeTab: string; team: Team }) => {
  const { activeTab, team } = props;

  const menus = [
    {
      name: "Members",
      href: `/teams/${team.slug}/members`,
      active: activeTab === "members",
    },
    {
      name: "Settings",
      href: `/teams/${team.slug}/settings`,
      active: activeTab === "settings",
    },
    {
      name: "SAML SSO",
      href: `/teams/${team.slug}/saml`,
      active: activeTab === "saml",
    },
    {
      name: "Directory Sync (SCIM)",
      href: `/teams/${team.slug}/directory-sync`,
      active: activeTab === "directory-sync",
    },
    {
      name: "Notifications",
      href: `/teams/${team.slug}/notifications`,
      active: activeTab === "notifications",
    },
  ];

  return (
    <div className="mb-5">
      <nav
        className="-mb-px flex space-x-5 border-b border-gray-300"
        aria-label="Tabs"
      >
        {menus.map((menu) => {
          return (
            <Link href={menu.href} key={menu.href}>
              <a
                className={classNames(
                  "inline-flex items-center border-b-2 py-4 text-sm font-medium",
                  menu.active
                    ? "border-gray-900 text-gray-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                {menu.name}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TeamTab;
