import {
  CodeBracketIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { forwardRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import TeamDropdown from './TeamDropdown';
import SidebarItem, { type SidebarMenuItem } from './SidebarItem';

interface SidebarMenus {
  [key: string]: SidebarMenuItem[];
}

export default forwardRef<HTMLElement, { isCollapsed: boolean }>(
  function Sidebar({ isCollapsed }, ref) {
    const { asPath, isReady, query } = useRouter();
    const { t } = useTranslation('common');
    const [activePathname, setActivePathname] = useState<null | string>(null);

    const { slug } = query as { slug: string };

    useEffect(() => {
      if (isReady && asPath) {
        const activePathname = new URL(asPath, location.href).pathname;
        setActivePathname(activePathname);
      }
    }, [asPath, isReady]);

    const sidebarMenus: SidebarMenus = {
      personal: [
        {
          name: t('all-teams'),
          href: '/teams',
          icon: RectangleStackIcon,
          active: activePathname === '/teams',
        },
        {
          name: t('account'),
          href: '/settings/account',
          icon: UserCircleIcon,
          active: activePathname === '/settings/account',
        },
        {
          name: t('password'),
          href: '/settings/password',
          icon: LockClosedIcon,
          active: activePathname === '/settings/password',
        },
      ],
      team: [
        {
          name: t('all-products'),
          href: `/teams/${slug}/products`,
          icon: CodeBracketIcon,
          active: activePathname === `/teams/${slug}/products`,
        },
        {
          name: t('settings'),
          href: `/teams/${slug}/settings`,
          icon: Cog6ToothIcon,
          active:
            activePathname?.startsWith(`/teams/${slug}`) &&
            !activePathname.includes('products'),
        },
      ],
    };

    const menus = sidebarMenus[slug ? 'team' : 'personal'];

    return (
      <>
        <aside
          className={`fixed ${!isCollapsed && 'z-10'} h-screen w-10/12 lg:w-64`}
          ref={ref}
          aria-label="Sidebar"
        >
          <div
            className={`relative ${
              isCollapsed && 'invisible'
            } lg:visible flex h-full flex-col border-r border-gray-200 dark:border-gray-600 bg-white dark:bg-black pt-0`}
          >
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex-1 space-y-1 divide-y dark:divide-gray-600">
                <TeamDropdown />
                <div className="p-4">
                  <ul className="space-y-1">
                    {menus.map((menu) => (
                      <li key={menu.name}>
                        <SidebarItem {...menu} />
                        <div className="flex-1">
                          <div className="mt-1 space-y-1">
                            {menu?.items?.map((submenu) => (
                              <SidebarItem
                                key={submenu.name}
                                {...submenu}
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
);
