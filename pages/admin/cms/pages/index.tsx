import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Link from 'next/link';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error as ErrorPanel } from '@/components/shared';
import { Button, Modal, Input, Select } from 'react-daisyui';
import { PlusIcon, PencilIcon, TrashIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import env from '@/lib/env';

const TEMPLATE_LABELS: Record<string, string> = {
  HOME: 'Home', ABOUT: 'About', FEATURES: 'Features',
  PRICING: 'Pricing', BLOG_POST: 'Blog Post', GENERIC: 'Generic',
};

const AdminCmsPagesPage = () => {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('GENERIC');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data, isLoading, error, mutate } = useSWR('/api/admin/cms/pages', fetcher);
  const pages = data?.data ?? [];

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, template }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      toast.success('Page created');
      setShowCreate(false);
      setSlug(''); setTitle(''); setTemplate('GENERIC');
      router.push(`/admin/cms/pages/${json.data.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (pageId: string, pageTitle: string) => {
    if (!confirm(`Delete page "${pageTitle}"?`)) return;
    setDeleting(pageId);
    try {
      const res = await fetch(`/api/admin/cms/pages/${pageId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error?.message || 'Failed');
      toast.success('Page deleted');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminShell title="CMS Pages">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-base-content/60">
            Manage public marketing pages. Publish to make them accessible at their slug.
          </p>
          <Button color="primary" size="sm" onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4 mr-1" /> New Page
          </Button>
        </div>

        {isLoading && <Loading />}
        {error && <ErrorPanel message={error.message} />}

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Title</th>
                <th>Template</th>
                <th>Status</th>
                <th>Sections</th>
                <th>Last updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page: any) => (
                <tr key={page.id}>
                  <td>
                    <code className="text-xs bg-base-200 px-2 py-0.5 rounded">
                      /{page.slug || ''}
                    </code>
                  </td>
                  <td className="font-medium">{page.title}</td>
                  <td className="text-sm">{TEMPLATE_LABELS[page.template] ?? page.template}</td>
                  <td>
                    <span className={`badge badge-sm ${page.status === 'PUBLISHED' ? 'badge-success' : 'badge-ghost'}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="text-sm">{page._count?.sections ?? 0}</td>
                  <td className="text-sm">{new Date(page.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1">
                      {page.status === 'PUBLISHED' && (
                        <a href={`/${page.slug}`} target="_blank" rel="noreferrer">
                          <Button size="xs" color="ghost" title="Preview">
                            <GlobeAltIcon className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Link href={`/admin/cms/pages/${page.id}`}>
                        <Button size="xs" color="ghost" title="Edit">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="xs"
                        color="ghost"
                        onClick={() => handleDelete(page.id, page.title)}
                        disabled={deleting === page.id}
                        loading={deleting === page.id}
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4 text-error" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && pages.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-base-content/50 py-8">
                    No pages yet. Create your first page above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal.Legacy open={showCreate} onClickBackdrop={() => setShowCreate(false)}>
        <Modal.Header className="font-bold">Create Page</Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Slug * (URL path)</span></label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="about-us"
              className="font-mono"
            />
            <label className="label"><span className="label-text-alt">Leave blank for the home page (/)</span></label>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Title *</span></label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="About Us" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Template</span></label>
            <Select value={template} onChange={(e) => setTemplate(e.target.value)}>
              {Object.entries(TEMPLATE_LABELS).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v}</Select.Option>
              ))}
            </Select>
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button color="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button color="primary" onClick={handleCreate} disabled={creating || !title} loading={creating}>
            Create
          </Button>
        </Modal.Actions>
      </Modal.Legacy>
    </AdminShell>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const adminEmails = env.adminEmails;
  if (!adminEmails?.includes((session.user as any)?.email)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
}

export default AdminCmsPagesPage;
