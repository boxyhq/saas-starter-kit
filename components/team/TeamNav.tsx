import NavItem from '@/components/shared/NavItem';
import {
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  KeyIcon,
  PaperAirplaneIcon,
  ShieldExclamationIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const TeamNav = ({ slug }: { slug: string }) => {
  const { route } = useRouter();
  const { t } = useTranslation('common');

  const activeTab = route.split('[slug]/')[1];

  const navigations = [
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      active: activeTab === 'settings',
      icon: Cog6ToothIcon,
    },
    {
      name: t('members'),
      href: `/teams/${slug}/members`,
      active: activeTab === 'members',
      icon: UserPlusIcon,
    },
    {
      name: t('single-sign-on'),
      href: `/teams/${slug}/saml`,
      active: activeTab === 'saml',
      icon: ShieldExclamationIcon,
    },
    {
      name: t('directory-sync'),
      href: `/teams/${slug}/directory-sync`,
      active: activeTab === 'directory-sync',
      icon: UserPlusIcon,
    },
    {
      name: t('audit-logs'),
      href: `/teams/${slug}/audit-logs`,
      active: activeTab === 'audit-logs',
      icon: DocumentMagnifyingGlassIcon,
    },
    {
      name: t('webhooks'),
      href: `/teams/${slug}/webhooks`,
      active: activeTab === 'webhooks',
      icon: PaperAirplaneIcon,
    },
    {
      name: t('api-keys'),
      href: '#',
      active: activeTab === 'api-keys',
      icon: KeyIcon,
    },
  ];

  return (
    <>
      {navigations.map((menu) => {
        return (
          <NavItem
            href={menu.href}
            text={menu.name}
            active={menu.active}
            key={menu.href}
            icon={menu.icon}
          />
        );
      })}
    </>
  );
};

export default TeamNav;
