import classNames from 'classnames';
import NextLink from 'next/link';

const NavItem = ({
  href,
  text,
  icon,
  active,
  onClick,
}: {
  href: string;
  text: string;
  icon: any;
  active: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) => {
  const Icon = icon;

  return (
    <NextLink href={href}>
      <a
        href={href}
        onClick={onClick}
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
