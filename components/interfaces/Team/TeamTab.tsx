import { teamNavigations } from '@/lib/teams';
import type { Team } from '@prisma/client';
import classNames from 'classnames';
import Link from 'next/link';

const TeamTab = ({ activeTab, team }: { activeTab: string; team: Team }) => {
  const navigations = teamNavigations(team.slug, activeTab);

  return (
    <div className="mb-5">
      <nav
        className="-mb-px flex space-x-5 border-b border-gray-300"
        aria-label="Tabs"
      >
        {navigations.map((menu) => {
          return (
            <Link href={menu.href} key={menu.href}>
              <a
                className={classNames(
                  'inline-flex items-center border-b-2 py-4 text-sm font-medium',
                  menu.active
                    ? 'border-gray-900 text-gray-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
