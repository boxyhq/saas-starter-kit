import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import SectionEditorModal from '@/components/cms/sections/SectionEditorModal';
import { Loading, Error } from '@/components/shared';
import { Button, Input, Modal, Select } from 'react-daisyui';
import {
  PlusIcon, TrashIcon, PencilSquareIcon, ArrowUpIcon, ArrowDownIcon,
  GlobeAltIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline';
import env from '@/lib/env';

const SECTION_TYPE_LABELS: Record<string, string> = {
  richtext: 'Rich Text', hero: 'Hero Banner', features_grid: 'Features Grid',
  cta: 'Call to Action', faq: 'FAQ', testimonials: 'Testimonials',
};

const AdminPageEditor = () => {
  const router = useRouter();
  const { pageId } = router.query as { pageId: string };

  const { data, isLoading, error, mutate } = useSWR(
    pageId ? `/api/admin/cms/pages/${pageId}` : null,
    fetcher
  );

  const page = data?.data;

  // Metadata state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  // Section state
  const [editingSection, setEditingSection] = useState<any>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState('richtext');
  const [addingSection, setAddingSection] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (page) {
      setTitle(page.title ?? '');
      setSlug(page.slug ?? '');
      setSeoTitle(page.seoTitle ?? '');
      setSeoDesc(page.seoDesc ?? '');
    }
  }, [page]);

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    try {
      const res = await fetch(`/api/admin/cms/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, seoTitle: seoTitle || null, seoDesc: seoDesc || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message || 'Failed');
      toast.success('Page details saved');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingMeta(false);
    }
  };

  const handlePublishToggle = async () => {
    setPublishing(true);
    const isPublished = page?.status === 'PUBLISHED';
    try {
      const res = await fetch(
        `/api/admin/cms/pages/${pageId}/${isPublished ? 'unpublish' : 'publish'}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error((await res.json()).error?.message || 'Failed');
      toast.success(isPublished ? 'Page unpublished' : 'Page published!');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleAddSection = async () => {
    setAddingSection(true);
    try {
      const res = await fetch(`/api/admin/cms/pages/${pageId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newSectionType, content: {} }),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message || 'Failed');
      toast.success('Section added');
      setShowAddSection(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section?')) return;
    const res = await fetch(`/api/admin/cms/pages/${pageId}/sections/${sectionId}`, { method: 'DELETE' });
    if (!res.ok) { toast.error('Failed to delete'); return; }
    toast.success('Section deleted');
    mutate();
  };

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const sections = page?.sections ?? [];
    const idx = sections.findIndex((s: any) => s.id === sectionId);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sections.length) return;

    const reordered = sections.map((s: any, i: number) => {
      if (i === idx) return { id: s.id, order: sections[swapIdx].order };
      if (i === swapIdx) return { id: s.id, order: sections[idx].order };
      return { id: s.id, order: s.order };
    });

    await fetch(`/api/admin/cms/pages/${pageId}/sections/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections: reordered }),
    });
    mutate();
  };

  if (isLoading) return <AdminShell><Loading /></AdminShell>;
  if (error) return <AdminShell><Error message={error.message} /></AdminShell>;

  const sections = page?.sections ?? [];
  const isPublished = page?.status === 'PUBLISHED';

  return (
    <AdminShell title={`Edit: ${page?.title ?? '…'}`}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: metadata */}
        <div className="xl:col-span-1 space-y-4">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body space-y-4">
              <h2 className="font-semibold">Page Details</h2>

              <div className="form-control">
                <label className="label"><span className="label-text">Title *</span></label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Slug</span></label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-sm" />
                <label className="label"><span className="label-text-alt text-base-content/40">URL: /{slug || ''}</span></label>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">SEO Title</span></label>
                <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">SEO Description</span></label>
                <textarea className="textarea textarea-bordered" rows={3} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
              </div>

              <Button color="primary" size="sm" onClick={handleSaveMeta} disabled={savingMeta} loading={savingMeta} className="w-full">
                Save Details
              </Button>

              <div className="divider my-0" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <span className={`badge badge-sm ${isPublished ? 'badge-success' : 'badge-ghost'}`}>
                    {page?.status}
                  </span>
                </div>
                <Button
                  size="sm"
                  color={isPublished ? 'ghost' : 'success'}
                  onClick={handlePublishToggle}
                  disabled={publishing}
                  loading={publishing}
                >
                  {isPublished ? (
                    <><EyeSlashIcon className="h-4 w-4 mr-1" /> Unpublish</>
                  ) : (
                    <><GlobeAltIcon className="h-4 w-4 mr-1" /> Publish</>
                  )}
                </Button>
              </div>

              {isPublished && (
                <a href={`/${slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm w-full">
                  Preview page →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: sections */}
        <div className="xl:col-span-2">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Sections ({sections.length})</h2>
                <Button color="primary" size="sm" onClick={() => setShowAddSection(true)}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Section
                </Button>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-12 text-base-content/40">
                  No sections yet. Add one to start building this page.
                </div>
              ) : (
                <div className="space-y-2">
                  {sections.map((section: any, idx: number) => (
                    <div key={section.id} className="flex items-center gap-3 p-3 border border-base-200 rounded-lg hover:border-base-300 transition-colors">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => handleMoveSection(section.id, 'up')} disabled={idx === 0} className="text-base-content/30 hover:text-base-content disabled:opacity-20">
                          <ArrowUpIcon className="h-3 w-3" />
                        </button>
                        <button onClick={() => handleMoveSection(section.id, 'down')} disabled={idx === sections.length - 1} className="text-base-content/30 hover:text-base-content disabled:opacity-20">
                          <ArrowDownIcon className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="badge badge-ghost badge-sm">
                          {SECTION_TYPE_LABELS[section.type] ?? section.type}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="xs" color="ghost" onClick={() => setEditingSection(section)} title="Edit">
                          <PencilSquareIcon className="h-4 w-4" />
                        </Button>
                        <Button size="xs" color="ghost" onClick={() => handleDeleteSection(section.id)} title="Delete">
                          <TrashIcon className="h-4 w-4 text-error" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section editor modal */}
      <SectionEditorModal
        section={editingSection}
        pageId={pageId}
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        onSaved={mutate}
      />

      {/* Add section type picker */}
      <Modal open={showAddSection} onClickBackdrop={() => setShowAddSection(false)}>
        <Modal.Header className="font-bold">Add Section</Modal.Header>
        <Modal.Body>
          <div className="form-control">
            <label className="label"><span className="label-text">Section Type</span></label>
            <Select value={newSectionType} onChange={(e) => setNewSectionType(e.target.value)}>
              {Object.entries(SECTION_TYPE_LABELS).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v}</Select.Option>
              ))}
            </Select>
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button color="ghost" onClick={() => setShowAddSection(false)}>Cancel</Button>
          <Button color="primary" onClick={handleAddSection} disabled={addingSection} loading={addingSection}>
            Add
          </Button>
        </Modal.Actions>
      </Modal>
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

export default AdminPageEditor;
