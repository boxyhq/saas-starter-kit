import {
  HashtagIcon,
  HomeIcon,
  LockClosedIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import useTeam from 'hooks/useTeam';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import TeamNav from '../interfaces/Team/TeamNav';
import NavItem from './NavItem';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: UsersIcon,
  },
  {
    name: 'Account',
    href: '/settings/account',
    icon: UserCircleIcon,
  },
  {
    name: 'Password',
    href: '/settings/password',
    icon: LockClosedIcon,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const { t } = useTranslation('common');

  const slug = router.query.slug as string;

  const { team } = useTeam(slug);

  return (
    <>
      <aside
        className="transition-width fixed top-0 left-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-12 duration-75 lg:flex"
        aria-label="Sidebar"
      >
        <div className="relative flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white pt-0">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex-1 space-y-1 divide-y bg-white px-3">
              <ul className="space-y-2 pb-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavItem
                      href={item.href}
                      text={item.name}
                      icon={item.icon}
                      active={router.pathname === item.href}
                    />
                  </li>
                ))}
              </ul>
              {team && (
                <div className="space-y-2 pt-2">
                  <span className='p-2 text-sm font-semibold flex gap-2'>
                    <HashtagIcon className="h-5 w-5" />
                    {team.name}
                  </span>
                  <TeamNav slug={slug} />
                </div>
              )}
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
