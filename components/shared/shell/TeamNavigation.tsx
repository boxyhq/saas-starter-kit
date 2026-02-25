import {
  Cog6ToothIcon,
  CodeBracketIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';

interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('all-products'),
      href: `/teams/${slug}/products`,
      icon: CodeBracketIcon,
      active: activePathname === `/teams/${slug}/products`,
    },
    {
      name: t('mdr-projects'),
      href: `/teams/${slug}/mdr`,
      icon: DocumentTextIcon,
      active: activePathname?.startsWith(`/teams/${slug}/mdr`) ?? false,
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        !activePathname.includes('products') &&
        !activePathname.includes('/mdr'),
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;
