import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Button, Input, Select, Textarea } from 'react-daisyui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import env from '@/lib/env';

const AdminHelpArticleNewPage = () => {
  const router = useRouter();
  const { data: catsData } = useSWR('/api/admin/help/categories', fetcher);
  const [form, setForm] = useState({ title: '', slug: '', categoryId: '', excerpt: '' });
  const [saving, setSaving] = useState(false);

  const categories = catsData?.data ?? [];
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch('/api/admin/help/articles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, content: {} }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message); }
      const { data } = await res.json();
      toast.success('Article created');
      router.push(`/admin/help/articles/${data.id}`);
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <AdminShell title="New Article">
      <div className="mb-4"><Link href="/admin/help/articles" className="btn btn-ghost btn-sm gap-1"><ArrowLeftIcon className="h-4 w-4" /> Back</Link></div>
      <form onSubmit={handleCreate} className="max-w-lg space-y-4">
        <div className="form-control"><label className="label label-text">Category</label>
          <Select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} required>
            <option value="">Select a category…</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        </div>
        <div className="form-control"><label className="label label-text">Title</label>
          <Input value={form.title} onChange={(e) => { set('title', e.target.value); set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} required />
        </div>
        <div className="form-control"><label className="label label-text">Slug</label>
          <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} pattern="[a-z0-9-]+" required />
        </div>
        <div className="form-control"><label className="label label-text">Excerpt (optional)</label>
          <Textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} />
        </div>
        <Button type="submit" color="primary" loading={saving} disabled={saving}>Create & Edit Content</Button>
      </form>
    </AdminShell>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  if (!env.adminEmails?.includes((session.user as any)?.email)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
}
export default AdminHelpArticleNewPage;
