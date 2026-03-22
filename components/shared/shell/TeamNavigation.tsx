import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';
import {
  AcademicCapIcon,
} from '@heroicons/react/24/outline';


interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('courses'),
      href: `/teams/${slug}/courses`,
      icon: AcademicCapIcon,
      active: activePathname === `/teams/${slug}/courses`,
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        !activePathname.includes('products') &&
        !activePathname.includes('courses'),
    },
  ];


  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;
