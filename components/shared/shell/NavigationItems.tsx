import Link from 'next/link';
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

export default NavigationItems;
