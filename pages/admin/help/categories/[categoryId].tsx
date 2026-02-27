import useSWR from 'swr';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error as ErrorPanel } from '@/components/shared';
import { Button, Input, Textarea } from 'react-daisyui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import env from '@/lib/env';

const AdminHelpCategoryEditPage = () => {
  const router = useRouter();
  const { categoryId } = router.query as { categoryId: string };
  const { data, isLoading, error, mutate } = useSWR(categoryId ? `/api/admin/help/categories/${categoryId}` : null, fetcher);
  const [form, setForm] = useState({ title: '', slug: '', description: '', icon: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.data) {
      const c = data.data;
      setForm({ title: c.title, slug: c.slug, description: c.description ?? '', icon: c.icon ?? '' });
    }
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`/api/admin/help/categories/${categoryId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message); }
      toast.success('Saved'); mutate();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const cat = data?.data;

  return (
    <AdminShell title="Edit Category">
      <div className="mb-4"><Link href="/admin/help/categories" className="btn btn-ghost btn-sm gap-1"><ArrowLeftIcon className="h-4 w-4" /> Back</Link></div>
      {isLoading && <Loading />}
      {error && <ErrorPanel message={error.message} />}
      {cat && (
        <div className="max-w-lg space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="form-control"><label className="label label-text">Title</label><Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
            <div className="form-control"><label className="label label-text">Slug</label><Input value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))} pattern="[a-z0-9-]+" required /></div>
            <div className="form-control"><label className="label label-text">Description</label><Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div className="form-control"><label className="label label-text">Icon (emoji or icon name)</label><Input value={form.icon} onChange={(e) => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="📚" /></div>
            <Button type="submit" color="primary" loading={saving} disabled={saving}>Save Changes</Button>
          </form>

          {cat.articles?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Articles in this category</h3>
              <ul className="space-y-1">
                {cat.articles.map((a: any) => (
                  <li key={a.id} className="flex items-center justify-between">
                    <Link href={`/admin/help/articles/${a.id}`} className="link text-sm">{a.title}</Link>
                    <span className={`badge badge-xs ${a.status === 'PUBLISHED' ? 'badge-success' : 'badge-ghost'}`}>{a.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  if (!env.adminEmails?.includes((session.user as any)?.email)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
}

export default AdminHelpCategoryEditPage;
