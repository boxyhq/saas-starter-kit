import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error as ErrorPanel } from '@/components/shared';
import { Button, Input, Textarea } from 'react-daisyui';
import env from '@/lib/env';

interface SettingsMap {
  site_name?: string;
  site_tagline?: string;
  site_logo_url?: string;
  site_favicon_url?: string;
  footer_copyright?: string;
  footer_links?: Array<{ label: string; href: string }>;
  social_twitter?: string;
  social_linkedin?: string;
  social_github?: string;
  cookie_banner_enabled?: boolean;
  cookie_banner_text?: string;
  support_email?: string;
}

const AdminSettingsPage = () => {
  const { data, isLoading, error } = useSWR('/api/admin/cms/settings', fetcher);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SettingsMap>({});
  const [footerLinksRaw, setFooterLinksRaw] = useState('');

  useEffect(() => {
    if (data?.data) {
      const s = data.data as SettingsMap;
      setForm(s);
      setFooterLinksRaw(
        Array.isArray(s.footer_links)
          ? s.footer_links.map((l) => `${l.label}|${l.href}`).join('\n')
          : ''
      );
    }
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Parse footer_links from raw text
      const footerLinks = footerLinksRaw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [label, href] = l.split('|').map((s) => s.trim());
          return { label: label ?? '', href: href ?? '' };
        })
        .filter((l) => l.label && l.href);

      const payload: SettingsMap = {
        ...form,
        footer_links: footerLinks,
      };

      const res = await fetch('/api/admin/cms/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success('Settings saved');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof SettingsMap, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <AdminShell title="Site Settings">
      {isLoading && <Loading />}
      {error && <ErrorPanel message={error.message} />}

      {!isLoading && !error && (
        <form onSubmit={handleSave} className="space-y-8 max-w-2xl">

          {/* Site Identity */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body space-y-4">
              <h2 className="font-semibold text-base">Site Identity</h2>

              <div className="form-control">
                <label className="label label-text">Site Name</label>
                <Input
                  value={form.site_name ?? ''}
                  onChange={(e) => set('site_name', e.target.value)}
                  placeholder="My SaaS Platform"
                />
              </div>

              <div className="form-control">
                <label className="label label-text">Tagline</label>
                <Input
                  value={form.site_tagline ?? ''}
                  onChange={(e) => set('site_tagline', e.target.value)}
                  placeholder="The fastest way to…"
                />
              </div>

              <div className="form-control">
                <label className="label label-text">Logo URL</label>
                <Input
                  value={form.site_logo_url ?? ''}
                  onChange={(e) => set('site_logo_url', e.target.value)}
                  placeholder="https://…/logo.png"
                />
              </div>

              <div className="form-control">
                <label className="label label-text">Favicon URL</label>
                <Input
                  value={form.site_favicon_url ?? ''}
                  onChange={(e) => set('site_favicon_url', e.target.value)}
                  placeholder="https://…/favicon.ico"
                />
              </div>

              <div className="form-control">
                <label className="label label-text">Support Email</label>
                <Input
                  type="email"
                  value={form.support_email ?? ''}
                  onChange={(e) => set('support_email', e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body space-y-4">
              <h2 className="font-semibold text-base">Social Links</h2>

              <div className="form-control">
                <label className="label label-text">Twitter / X handle</label>
                <Input
                  value={form.social_twitter ?? ''}
                  onChange={(e) => set('social_twitter', e.target.value)}
                  placeholder="@yourhandle"
                />
              </div>

              <div className="form-control">
                <label className="label label-text">LinkedIn URL</label>
                <Input
                  value={form.social_linkedin ?? ''}
                  onChange={(e) => set('social_linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/…"
                />
              </div>

              <div className="form-control">
                <label className="label label-text">GitHub URL</label>
                <Input
                  value={form.social_github ?? ''}
                  onChange={(e) => set('social_github', e.target.value)}
                  placeholder="https://github.com/…"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body space-y-4">
              <h2 className="font-semibold text-base">Footer</h2>

              <div className="form-control">
                <label className="label label-text">Copyright text</label>
                <Input
                  value={form.footer_copyright ?? ''}
                  onChange={(e) => set('footer_copyright', e.target.value)}
                  placeholder={`© ${new Date().getFullYear()} My Company. All rights reserved.`}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Footer links</span>
                  <span className="label-text-alt text-xs">One per line — format: Label|/path</span>
                </label>
                <Textarea
                  value={footerLinksRaw}
                  onChange={(e) => setFooterLinksRaw(e.target.value)}
                  rows={4}
                  placeholder={"Privacy Policy|/privacy\nTerms of Service|/terms\nContact|/contact"}
                />
              </div>
            </div>
          </div>

          {/* Cookie Banner */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body space-y-4">
              <h2 className="font-semibold text-base">Cookie Banner</h2>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={!!form.cookie_banner_enabled}
                    onChange={(e) => set('cookie_banner_enabled', e.target.checked)}
                  />
                  <span className="label-text">Enable cookie consent banner</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label label-text">Banner text</label>
                <Textarea
                  value={form.cookie_banner_text ?? ''}
                  onChange={(e) => set('cookie_banner_text', e.target.value)}
                  rows={3}
                  placeholder="We use cookies to improve your experience. By using this site you accept our cookie policy."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" color="primary" loading={saving} disabled={saving}>
              Save All Settings
            </Button>
          </div>
        </form>
      )}
    </AdminShell>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const adminEmails = env.adminEmails;
  const userEmail = (session.user as any)?.email;
  if (!adminEmails?.includes(userEmail)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
}

export default AdminSettingsPage;
