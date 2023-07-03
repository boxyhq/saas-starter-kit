import {
  ChevronUpDownIcon,
  CircleStackIcon,
  FolderIcon,
  FolderPlusIcon,
  HomeIcon,
  LockClosedIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Team } from '@prisma/client';
import useTeams from 'hooks/useTeams';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import NavItem from './NavItem';

interface TeamDropdownProps {
  teams: Team[];
  currentTeam: Team;
}

export default function Sidebar() {
  const router = useRouter();
  const { teams } = useTeams();
  const { t } = useTranslation('common');

  const currentTeam = teams?.find((team) => team.slug === router.query.slug);

  if (!currentTeam || !teams) {
    return null;
  }

  return (
    <>
      <aside
        className="transition-width fixed top-0 left-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-12 duration-75 lg:flex"
        aria-label="Sidebar"
      >
        <div className="relative flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white pt-0">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex-1 space-y-1 divide-y bg-white">
              <TeamDropdown teams={teams} currentTeam={currentTeam} />

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

              {/* <div className="p-4">
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
              </div> */}

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

const TeamDropdown = ({ teams, currentTeam }: TeamDropdownProps) => {
  // const router = useRouter();

  // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   router.push(`/teams/${e.target.value}/settings`);
  // };

  const { data } = useSession();

  return (
    <div className="px-4 py-2">
      <div className="flex">
        <div className="dropdown w-full">
          <div
            tabIndex={0}
            className="border border-gray-300 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
          >
            {currentTeam.name} <ChevronUpDownIcon className="w-5 h-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content p-2 shadow-md bg-base-100 w-full rounded border px-2"
          >
            <li className="text-xs text-gray-500 py-1 px-2">Personal</li>
            <li>
              <Link href="/settings/account">
                <div className="flex hover:bg-gray-100 focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center">
                  <UserCircleIcon className="w-5 h-5" /> {data?.user?.name}
                </div>
              </Link>
            </li>
            <li className="divider m-0" />
            <li className="text-xs text-gray-500 py-1 px-2">Teams</li>
            {teams.map((team) => (
              <li key={team.slug}>
                <Link href={`/teams/${team.slug}/settings`} className="">
                  <div className="flex hover:bg-gray-100 focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center">
                    <FolderIcon className="w-5 h-5" /> {team.name}
                  </div>
                </Link>
              </li>
            ))}
            <li className="divider m-0" />
            <li>
              <Link href="/teams/create">
                <div className="flex hover:bg-gray-100 focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center">
                  <FolderPlusIcon className="w-5 h-5" /> Create Team
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // return (
  //   <select
  //     className="select select-bordered w-full max-w-xs rounded"
  //     value={currentTeam.slug}
  //     onChange={handleChange}
  //   >
  //     {teams.map((team) => (
  //       <option key={team.slug} value={team.slug}>
  //         <span className="inline-block">
  //           {team.name} <FolderIcon className="w-5 h-5" />
  //         </span>
  //       </option>
  //     ))}
  //     <option value="create">Create a Team</option>
  //   </select>
  // );
};
