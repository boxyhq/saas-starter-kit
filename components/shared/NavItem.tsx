import classNames from 'classnames';
import NextLink from 'next/link';

interface NavItemProps {
  href: string;
  text: string;
  icon?: any;
  active: boolean;
}

const NavItem = ({ href, text, icon, active }: NavItemProps) => {
  const Icon = icon;

  return (
    (<NextLink
      href={href}
      className={classNames(
        active ? 'bg-gray-100' : '',
        'flex items-center rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-100 p-2'
      )}>

      <div className="flex gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        <span>{text}</span>
      </div>

    </NextLink>)
  );
};

export default NavItem;
