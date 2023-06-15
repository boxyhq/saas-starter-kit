import { teamNavigations } from '@/lib/teams';
import type { Team } from '@prisma/client';
import classNames from 'classnames';
import Link from 'next/link';

interface TeamTabProps {
  activeTab: string;
  team: Team;
  heading?: string;
}

const TeamTab = (props: TeamTabProps) => {
  const { activeTab, team, heading } = props;

  const navigations = teamNavigations(team.slug, activeTab);

  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-semibold mb-2">{heading ? heading : team.name}</h2>
      <nav
        className=" flex space-x-5 border-b border-gray-300"
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
