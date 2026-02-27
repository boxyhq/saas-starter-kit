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

const AdminHelpCategoriesPage = () => {
  const { data, isLoading, error, mutate } = useSWR('/api/admin/help/categories', fetcher);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const categories = data?.data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/help/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, slug: newSlug }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message); }
      toast.success('Category created');
      setNewTitle(''); setNewSlug('');
      mutate();
    } catch (err: any) { toast.error(err.message); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category and all its articles?')) return;
    const res = await fetch(`/api/admin/help/categories/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); mutate(); }
    else toast.error('Failed to delete');
  };

  return (
    <AdminShell title="Help Categories">
      <div className="max-w-3xl space-y-6">
        {/* Create form */}
        <form onSubmit={handleCreate} className="flex gap-3 items-end flex-wrap">
          <div className="form-control">
            <label className="label label-text text-xs">Title</label>
            <Input value={newTitle} onChange={(e) => { setNewTitle(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} placeholder="Getting Started" className="input-sm" required />
          </div>
          <div className="form-control">
            <label className="label label-text text-xs">Slug</label>
            <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="getting-started" className="input-sm" required pattern="[a-z0-9-]+" />
          </div>
          <Button type="submit" size="sm" color="primary" loading={creating} disabled={creating}>Add Category</Button>
        </form>

        {isLoading && <Loading />}
        {error && <ErrorPanel message={error.message} />}

        <table className="table table-zebra w-full">
          <thead><tr><th>Title</th><th>Slug</th><th>Articles</th><th>Actions</th></tr></thead>
          <tbody>
            {categories.map((c: any) => (
              <tr key={c.id}>
                <td><Link href={`/admin/help/categories/${c.id}`} className="link">{c.title}</Link></td>
                <td className="font-mono text-xs">{c.slug}</td>
                <td>{c._count?.articles ?? 0}</td>
                <td className="flex gap-1">
                  <Link href={`/admin/help/categories/${c.id}`} className="btn btn-xs btn-ghost">Edit</Link>
                  <Button size="xs" color="error" onClick={() => handleDelete(c.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {!isLoading && categories.length === 0 && (
              <tr><td colSpan={4} className="text-center text-base-content/50 py-6">No categories yet</td></tr>
            )}
          </tbody>
        </table>
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

export default AdminHelpCategoriesPage;
