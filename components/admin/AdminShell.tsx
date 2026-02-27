import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  ShieldExclamationIcon,
  CreditCardIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { label: 'Users', href: '/admin/users', icon: UsersIcon },
  { label: 'Teams', href: '/admin/teams', icon: BuildingOfficeIcon },
  { label: 'Plans', href: '/admin/plans', icon: CreditCardIcon },
  { label: 'Jobs', href: '/admin/jobs', icon: CpuChipIcon },
  { label: 'CMS', href: '/admin/cms', icon: DocumentTextIcon },
  { label: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
}

export const ImpersonationBanner = () => {
  const { data: session } = useSession();
  const impersonating = (session as any)?.impersonating;
  if (!impersonating) return null;

  const handleExit = async () => {
    await fetch('/api/admin/impersonation/exit', { method: 'POST' });
    window.location.href = '/admin';
  };

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-warning text-warning-content px-4 py-2 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <ShieldExclamationIcon className="h-5 w-5" />
        <span className="text-sm font-medium">
          Viewing as <strong>{impersonating.email}</strong> (admin impersonation)
        </span>
      </div>
      <button onClick={handleExit} className="btn btn-xs btn-neutral">
        Exit Impersonation
      </button>
    </div>
  );
};

const AdminShell: React.FC<AdminShellProps> = ({ children, title }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login?returnUrl=' + encodeURIComponent(router.asPath));
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-base-200">
      <ImpersonationBanner />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen bg-base-100 border-r border-base-300 flex flex-col">
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center gap-2">
              <ShieldExclamationIcon className="h-5 w-5 text-error" />
              <span className="font-bold text-sm">ADMIN</span>
              <span className="badge badge-error badge-xs">INTERNAL</span>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {adminNav.map(({ label, href, icon: Icon }) => {
              const active = router.pathname === href || (href !== '/admin' && router.pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-200 text-base-content'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-base-300">
            <p className="text-xs text-base-content/40 truncate">{(session?.user as any)?.email}</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {title && (
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
