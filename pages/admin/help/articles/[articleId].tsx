import useSWR from 'swr';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error as ErrorPanel } from '@/components/shared';
import { Button, Input, Textarea, Select } from 'react-daisyui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import env from '@/lib/env';

const TiptapEditor = dynamic(() => import('@/components/cms/TiptapEditor'), { ssr: false });

const AdminHelpArticleEditPage = () => {
  const router = useRouter();
  const { articleId } = router.query as { articleId: string };
  const { data, isLoading, error, mutate } = useSWR(articleId ? `/api/admin/help/articles/${articleId}` : null, fetcher);
  const { data: catsData } = useSWR('/api/admin/help/categories', fetcher);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', pageContext: '', categoryId: '' });
  const [content, setContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const categories = catsData?.data ?? [];

  useEffect(() => {
    if (data?.data) {
      const a = data.data;
      setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt ?? '', pageContext: a.pageContext ?? '', categoryId: a.categoryId });
      setContent(a.content);
    }
  }, [data]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`/api/admin/help/articles/${articleId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, content }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message); }
      toast.success('Saved'); mutate();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async () => {
    const a = data?.data;
    if (!a) return;
    setPublishing(true);
    const endpoint = a.status === 'PUBLISHED' ? 'unpublish' : 'publish';
    try {
      const res = await fetch(`/api/admin/help/articles/${articleId}/${endpoint}`, { method: 'POST' });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message); }
      toast.success(a.status === 'PUBLISHED' ? 'Unpublished' : 'Published'); mutate();
    } catch (err: any) { toast.error(err.message); }
    finally { setPublishing(false); }
  };

  const article = data?.data;

  return (
    <AdminShell title="Edit Article">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/admin/help/articles" className="btn btn-ghost btn-sm gap-1"><ArrowLeftIcon className="h-4 w-4" /> Back</Link>
        {article && (
          <div className="flex items-center gap-3">
            <span className={`badge ${article.status === 'PUBLISHED' ? 'badge-success' : 'badge-ghost'}`}>{article.status}</span>
            <span className="text-xs text-base-content/50">{article.views} views · {article.helpful} helpful · {article.notHelpful} not helpful</span>
            <Button size="sm" color={article.status === 'PUBLISHED' ? 'warning' : 'success'} onClick={handleTogglePublish} loading={publishing} disabled={publishing}>
              {article.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        )}
      </div>

      {isLoading && <Loading />}
      {error && <ErrorPanel message={error.message} />}

      {article && (
        <form onSubmit={handleSave} className="space-y-4 max-w-3xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control"><label className="label label-text text-xs">Title</label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} required />
            </div>
            <div className="form-control"><label className="label label-text text-xs">Slug</label>
              <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} pattern="[a-z0-9-]+" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control"><label className="label label-text text-xs">Category</label>
              <Select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </Select>
            </div>
            <div className="form-control"><label className="label label-text text-xs">Page Context (regex)</label>
              <Input value={form.pageContext} onChange={(e) => set('pageContext', e.target.value)} placeholder="^/teams/.*/mdr/.*$" />
            </div>
          </div>
          <div className="form-control"><label className="label label-text text-xs">Excerpt</label>
            <Textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} />
          </div>
          <div className="form-control">
            <label className="label label-text text-xs">Content</label>
            <div className="border border-base-300 rounded-lg overflow-hidden">
              <TiptapEditor value={content} onChange={setContent} placeholder="Write your article here…" />
            </div>
          </div>
          <Button type="submit" color="primary" loading={saving} disabled={saving}>Save Changes</Button>
        </form>
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
export default AdminHelpArticleEditPage;
