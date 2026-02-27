import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error as ErrorPanel } from '@/components/shared';
import { Button, Input } from 'react-daisyui';
import env from '@/lib/env';

const AdminHelpArticlesPage = () => {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, error, mutate } = useSWR(
    `/api/admin/help/articles${search ? `?q=${encodeURIComponent(search)}` : ''}`, fetcher
  );

  const articles = data?.data?.articles ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    const res = await fetch(`/api/admin/help/articles/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); mutate(); }
    else toast.error('Failed to delete');
  };

  const handleToggleStatus = async (id: string, status: string) => {
    const endpoint = status === 'PUBLISHED' ? 'unpublish' : 'publish';
    const res = await fetch(`/api/admin/help/articles/${id}/${endpoint}`, { method: 'POST' });
    if (res.ok) { toast.success(status === 'PUBLISHED' ? 'Unpublished' : 'Published'); mutate(); }
    else toast.error('Failed');
  };

  return (
    <AdminShell title="Help Articles">
      <div className="max-w-4xl space-y-4">
        <div className="flex gap-3 items-center justify-between">
          <form onSubmit={(e) => { e.preventDefault(); setSearch(q); }} className="flex gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="input-sm max-w-xs" />
            <Button type="submit" size="sm" color="primary">Search</Button>
          </form>
          <Link href="/admin/help/articles/new" className="btn btn-sm btn-success">+ New Article</Link>
        </div>

        {isLoading && <Loading />}
        {error && <ErrorPanel message={error.message} />}

        <table className="table table-zebra w-full text-sm">
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Actions</th></tr></thead>
          <tbody>
            {articles.map((a: any) => (
              <tr key={a.id}>
                <td><Link href={`/admin/help/articles/${a.id}`} className="link">{a.title}</Link></td>
                <td className="text-base-content/60">{a.category?.title ?? '—'}</td>
                <td><span className={`badge badge-xs ${a.status === 'PUBLISHED' ? 'badge-success' : 'badge-ghost'}`}>{a.status}</span></td>
                <td>{a.views}</td>
                <td className="flex gap-1">
                  <Link href={`/admin/help/articles/${a.id}`} className="btn btn-xs btn-ghost">Edit</Link>
                  <Button size="xs" color={a.status === 'PUBLISHED' ? 'warning' : 'success'} onClick={() => handleToggleStatus(a.id, a.status)}>
                    {a.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button size="xs" color="error" onClick={() => handleDelete(a.id)}>Del</Button>
                </td>
              </tr>
            ))}
            {!isLoading && articles.length === 0 && (
              <tr><td colSpan={5} className="text-center text-base-content/50 py-6">No articles found</td></tr>
            )}
          </tbody>
        </table>
        {data?.data && <p className="text-xs text-base-content/40">Showing {articles.length} of {data.data.total}</p>}
      </div>
    </AdminShell>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  if (!env.adminEmails?.includes((session.user as any)?.email)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
}
export default AdminHelpArticlesPage;
