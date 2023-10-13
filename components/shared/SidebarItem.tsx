import classNames from 'classnames';
import NextLink from 'next/link';
import { useTranslation } from 'next-i18next';

export interface SidebarMenuItem {
  name: string;
  href: string;
  icon?: any;
  active?: boolean;
  items?: Omit<SidebarMenuItem, 'icon' | 'items'>[];
  className?: string;
}

const SidebarItem = ({
  href,
  name,
  icon,
  active,
  className,
}: SidebarMenuItem) => {
  const { t } = useTranslation('common');
  const Icon = icon;

  return (
    <NextLink
      href={href}
      className={classNames(
        active ? 'bg-gray-100 font-semibold' : 'dark:text-white',
        'flex items-center rounded-lg text-sm text-gray-900 hover:dark:text-black hover:bg-gray-100 p-2',
        className
      )}
    >
      <div className="flex gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        <span>{t(name)}</span>
      </div>
    </NextLink>
  );
};

export default SidebarItem;
