import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error } from '@/components/shared';
import { Button, Input } from 'react-daisyui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import env from '@/lib/env';

interface NavLink { label: string; url: string }

const AdminCmsSettingsPage = () => {
  const { data, isLoading, error, mutate } = useSWR('/api/admin/cms/settings', fetcher);
  const settings = data?.data ?? {};

  const [siteName, setSiteName] = useState('');
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [footerLinks, setFooterLinks] = useState<NavLink[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setSiteName((settings.site_name as string) ?? '');
      setNavLinks((settings.nav_links as NavLink[]) ?? []);
      setFooterLinks((settings.footer_links as NavLink[]) ?? []);
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_name: siteName,
          nav_links: navLinks,
          footer_links: footerLinks,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message || 'Failed');
      toast.success('Settings saved');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const LinkEditor: React.FC<{
    label: string;
    links: NavLink[];
    onChange: (links: NavLink[]) => void;
  }> = ({ label, links, onChange }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label-text font-medium">{label}</label>
        <Button size="xs" color="ghost" onClick={() => onChange([...links, { label: '', url: '' }])}>
          <PlusIcon className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      {links.map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Label"
            size="sm"
            value={link.label}
            onChange={(e) => onChange(links.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l))}
            className="w-40"
          />
          <Input
            placeholder="URL"
            size="sm"
            value={link.url}
            onChange={(e) => onChange(links.map((l, idx) => idx === i ? { ...l, url: e.target.value } : l))}
            className="flex-1"
          />
          <Button size="xs" color="ghost" onClick={() => onChange(links.filter((_, idx) => idx !== i))}>
            <TrashIcon className="h-4 w-4 text-error" />
          </Button>
        </div>
      ))}
      {links.length === 0 && <p className="text-xs text-base-content/40 italic">No links added.</p>}
    </div>
  );

  return (
    <AdminShell title="Site Settings">
      {isLoading && <Loading />}
      {error && <Error message={error.message} />}
      {!isLoading && (
        <div className="max-w-2xl space-y-6">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body space-y-6">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Site Name</span></label>
                <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="My SaaS Product" />
                <label className="label"><span className="label-text-alt">Shown in the header and page titles</span></label>
              </div>

              <div className="divider" />

              <LinkEditor label="Navigation Links (header)" links={navLinks} onChange={setNavLinks} />

              <div className="divider" />

              <LinkEditor label="Footer Links" links={footerLinks} onChange={setFooterLinks} />

              <div className="card-actions justify-end pt-2">
                <Button color="primary" onClick={handleSave} disabled={saving} loading={saving}>
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions());
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const adminEmails = env.adminEmails;
  if (!adminEmails?.includes((session.user as any)?.email)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
}

export default AdminCmsSettingsPage;
