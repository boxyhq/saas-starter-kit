import {
  ArrowLeftOnRectangleIcon,
  HomeIcon,
  KeyIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/solid';
import useTeam from 'hooks/useTeam';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import TeamNav from '../interfaces/Team/TeamNav';
import NavItem from './NavItem';

export default function Sidebar() {
  const router = useRouter();
  const { t } = useTranslation('common');

  const slug = router.query.slug as string;

  const { team } = useTeam(slug);

  return (
    <>
      <aside
        className="transition-width fixed top-0 left-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-16 duration-75 lg:flex"
        aria-label="Sidebar"
      >
        <div className="relative flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white pt-0">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex-1 space-y-1 divide-y bg-white px-3">
              <ul className="space-y-2 pb-2">
                <li>
                  <form action="#" method="GET" className="lg:hidden">
                    <label htmlFor="mobile-search" className="sr-only">
                      {t('search')}
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          className="h-5 w-5 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="email"
                        id="mobile-search"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:ring-cyan-600"
                        placeholder="Search"
                      />
                    </div>
                  </form>
                </li>
                <li>
                  <NavItem
                    href="/dashboard"
                    text="Dashboard"
                    icon={HomeIcon}
                    active={router.pathname === '/dashboard'}
                  />
                </li>
                <li>
                  <NavItem
                    href="/teams"
                    text="Teams"
                    icon={UsersIcon}
                    active={router.pathname === '/teams'}
                  />
                </li>
              </ul>
              {team && (
                <div className="space-y-2 pt-2">
                  <NavItem
                    href="javascript:void(0);"
                    text={team.name}
                    icon={UsersIcon}
                    active={false}
                  />
                  <TeamNav slug={slug} />
                </div>
              )}
              <div className="space-y-2 pt-2">
                <NavItem
                  href="/settings/account"
                  text="Account"
                  icon={UserIcon}
                  active={router.pathname === '/settings/account'}
                />
                <NavItem
                  href="/settings/password"
                  text="Password"
                  icon={KeyIcon}
                  active={router.pathname === '/settings/password'}
                />
                <NavItem
                  href="#"
                  text="Logout"
                  icon={ArrowLeftOnRectangleIcon}
                  onClick={() => signOut()}
                  active={false}
                />
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
