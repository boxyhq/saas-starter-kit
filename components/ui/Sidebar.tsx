import {
  BuildingOfficeIcon,
  CircleStackIcon,
  HomeIcon,
  LockClosedIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import NavItem from './NavItem';

export default function Sidebar() {
  const router = useRouter();
  const { teams } = useTeams();
  const { t } = useTranslation('common');

  return (
    <>
      <aside
        className="transition-width fixed top-0 left-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-12 duration-75 lg:flex"
        aria-label="Sidebar"
      >
        <div className="relative flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white pt-0">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex-1 space-y-1 divide-y bg-white">
              <div className="p-4">
                <ul className="space-y-1">
                  <li>
                    <NavItem
                      href="/dashboard"
                      text={t('dashboard')}
                      icon={HomeIcon}
                      active={router.pathname === '/dashboard'}
                    />
                  </li>
                  <li>
                    <NavItem
                      href="/products"
                      text={t('products')}
                      icon={CircleStackIcon}
                      active={router.pathname === '/products'}
                    />
                  </li>
                </ul>
              </div>

              <div className="p-4">
                <span className="flex text-sm px-2 mb-2">{t('teams')}</span>
                <ul className="space-y-1">
                  {teams &&
                    teams.map((item) => (
                      <li key={item.name}>
                        <NavItem
                          href={`/teams/${item.slug}/settings`}
                          text={item.name}
                          icon={BuildingOfficeIcon}
                          active={router.asPath.includes(`/teams/${item.slug}`)}
                        />
                      </li>
                    ))}
                </ul>
              </div>

              <div className="p-4">
                <span className="flex text-sm px-2 mb-2">{t('account')}</span>
                <ul className="space-y-1">
                  <li>
                    <NavItem
                      href="/settings/account"
                      text={t('account-info')}
                      icon={UserCircleIcon}
                      active={router.pathname === '/settings/account'}
                    />
                  </li>
                  <li>
                    <NavItem
                      href="/settings/password"
                      text={t('password')}
                      icon={LockClosedIcon}
                      active={router.pathname === '/settings/password'}
                    />
                  </li>
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
