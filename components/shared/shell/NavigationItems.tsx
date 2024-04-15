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

interface NavigationItemProps {
  menu: MenuItem;
  className?: string;
}

const NavigationItems = ({ menus }: NavigationItemsProps) => {
  return (
    <ul role="list" className="flex flex-1 flex-col gap-1">
      {menus.map((menu) => (
        <li key={menu.name}>
          <NavigationItem menu={menu} />
          {menu.items && (
            <ul className="flex flex-col gap-1 mt-1">
              {menu.items.map((subitem) => (
                <li key={subitem.name}>
                  <NavigationItem menu={subitem} className="pl-9" />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};

const NavigationItem = ({ menu, className }: NavigationItemProps) => {
  return (
    <Link
      href={menu.href}
      className={`group flex items-center rounded text-sm text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-800 px-2 p-2 gap-2 ${
        menu.active ? 'text-white bg-gray-800 font-semibold' : ''
      }${className}`}
    >
      {menu.icon && (
        <menu.icon
          className={classNames({
            'h-5 w-5 shrink-0 group-hover:text-gray-900 dark:group-hover:text-gray-100':
              true,
            'text-gray-100': menu.active,
          })}
          aria-hidden="true"
        />
      )}
      {menu.name}
    </Link>
  );
};

export default NavigationItems;
