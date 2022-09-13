import Link from "next/link";
import classNames from "classnames";

import type { Team, Tenant } from "@prisma/client";

const TeamTab = (props: { activeTab: string; tenant: Tenant; team: Team }) => {
  const { activeTab, tenant, team } = props;

  const menus = [
    {
      name: "Members",
      href: `/organizations/${tenant.slug}/teams/${team.name}/members`,
      active: activeTab === "members",
    },
    {
      name: "Settings",
      href: `/organizations/${tenant.slug}/teams/${team.name}/settings`,
      active: activeTab === "settings",
    },
    {
      name: "Notifications",
      href: `/organizations/${tenant.slug}/teams/${team.name}/notifications`,
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
