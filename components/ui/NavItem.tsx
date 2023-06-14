import classNames from 'classnames';
import NextLink from 'next/link';

interface NavItemProps {
  href: string;
  text: string;
  icon: any;
  active: boolean;
}

const NavItem = ({ href, text, icon, active }: NavItemProps) => {
  const Icon = icon;

  return (
    <NextLink href={href}>
      <a
        href={href}
        className={classNames(
          active ? 'bg-gray-100' : '',
          'flex items-center rounded-lg p-2 text-sm font-semibold text-gray-900 hover:bg-gray-100'
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="ml-3">{text}</span>
      </a>
    </NextLink>
  );
};

export default NavItem;
