import Link from 'next/link';
import {
  Cog6ToothIcon,
  CodeBracketIcon,
  LockClosedIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import classNames from 'classnames';

export interface MenuItem {
  name: string;
  href: string;
  icon?: any;
  active?: boolean;
  items?: Omit<MenuItem, 'icon' | 'items'>[];
  className?: string;
}

export interface NavigationProps {
  activePathname: string | null;
}

interface NavigationItemsProps {
  menus: MenuItem[];
}

const NavigationItems = ({ menus }: NavigationItemsProps) => {
  return (
    <ul role="list" className="flex flex-1 flex-col gap-1">
      {menus.map((item) => (
        <li key={item.name}>
          <Link
            href={item.href}
            className={classNames({
              'flex items-center rounded text-sm text-gray-900 hover:bg-gray-100 px-2 p-2 gap-2 hover:dark:text-black':
                true,
              'bg-gray-100 font-semibold': item.active,
            })}
          >
            <item.icon
              className={classNames({
                'h-5 w-5 shrink-0': true,
                'text-primary': item.active,
              })}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

// User navigation
export const UserNavigation = ({ activePathname }: NavigationProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
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
  ];

  return <NavigationItems menus={menus} />;
};

// Team navigation
export const TeamNavigation = ({
  slug,
  activePathname,
}: NavigationProps & { slug: string }) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
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
  ];

  return <NavigationItems menus={menus} />;
};

export default NavigationItems;
