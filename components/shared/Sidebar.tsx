import {
  CodeBracketIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';

import SidebarItem, { type SidebarMenuItem } from './SidebarItem';
import TeamDropdown from './TeamDropdown';

interface SidebarMenus {
  [key: string]: SidebarMenuItem[];
}

export default function Sidebar() {
  const router = useRouter();
  const { t } = useTranslation('common');

  const { slug } = router.query;

  const sidebarMenus: SidebarMenus = {
    personal: [
      {
        name: t('all-teams'),
        href: '/teams',
        icon: RectangleStackIcon,
      },
      {
        name: t('account'),
        href: '/settings/account',
        icon: UserCircleIcon,
      },
      {
        name: t('password'),
        href: '/settings/password',
        icon: LockClosedIcon,
      },
    ],
    team: [
      {
        name: t('all-products'),
        href: `/teams/${slug}/products`,
        icon: CodeBracketIcon,
      },
      {
        name: t('settings'),
        href: `/teams/${slug}/settings`,
        icon: Cog6ToothIcon,
      },
    ],
  };

  const menus = sidebarMenus[slug ? 'team' : 'personal'];

  return (
    <>
      <aside
        className="transition-width fixed top-0 left-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-12 duration-75 lg:flex"
        aria-label="Sidebar"
      >
        <div className="relative flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white pt-0">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex-1 space-y-1 divide-y bg-white">
              <TeamDropdown />
              <div className="p-4">
                <ul className="space-y-1">
                  {menus.map((menu) => (
                    <li key={menu.name}>
                      <SidebarItem
                        href={menu.href}
                        name={t(menu.name)}
                        icon={menu.icon}
                        active={router.asPath === menu.href}
                        items={menu.items}
                      />
                      <div className="flex-1">
                        <div className="mt-1 space-y-1">
                          {menu?.items?.map((submenu) => (
                            <SidebarItem
                              key={submenu.name}
                              href={submenu.href}
                              name={submenu.name}
                              active={router.asPath === submenu.href}
                              className="pl-8"
                            />
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div
        className="fixed inset-0 z-10 hidden bg-gray-900 opacity-50"
        id="sidebarBackdrop"
      />
    </>
  );
}
