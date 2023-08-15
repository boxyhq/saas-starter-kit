'use client'

import {
  CodeBracketIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import SidebarItem, { type SidebarMenuItem } from './SidebarItem';
import TeamDropdown from './TeamDropdown';
import { forwardRef } from 'react';

interface SidebarMenus {
  [key: string]: SidebarMenuItem[];
}

export default forwardRef<HTMLElement, { isCollapsed: boolean }>(function Sidebar({ isCollapsed }, ref) {
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
        ref={ref}
        aria-label="Sidebar"
      >
        <div className={`relative ${isCollapsed && "invisible"} lg:visible flex h-full flex-1 flex-col border-r border-gray-200 bg-white pt-0`}>
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
});
