import { useEffect, useState } from 'react';
import {
  Cog6ToothIcon,
  CodeBracketIcon,
  LockClosedIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { type SidebarMenuItem } from '../SidebarItem';
import Header from './Header';
import Drawer from './Drawer';

interface SidebarMenus {
  [key: string]: SidebarMenuItem[];
}

export default function AppShell({ children }) {
  const { status } = useSession();
  const { t } = useTranslation('common');
  const { asPath, isReady, query } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePathname, setActivePathname] = useState<null | string>(null);

  const { slug } = query as { slug: string };

  useEffect(() => {
    if (isReady && asPath) {
      const activePathname = new URL(asPath, location.href).pathname;
      setActivePathname(activePathname);
    }
  }, [asPath, isReady]);

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    return <p>Access Denied</p>;
  }

  const sidebarMenus: SidebarMenus = {
    personal: [
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
    ],
    team: [
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
    ],
  };

  const navigation = sidebarMenus[slug ? 'team' : 'personal'];

  return (
    <div>
      {/* Left side of the app shell */}
      <Drawer
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigation={navigation}
      />

      {/* Right side of the app shell */}
      <div className="lg:pl-72">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
