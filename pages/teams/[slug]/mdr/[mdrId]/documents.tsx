import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error as ErrorPanel, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import MdrDocumentTable from '@/components/mdr/MdrDocumentTable';
import MdrDocumentUploader from '@/components/mdr/MdrDocumentUploader';
import MdrDocumentPreview from '@/components/mdr/MdrDocumentPreview';

const STATUS_OPTIONS = ['DRAFT', 'FOR_REVIEW', 'APPROVED', 'REJECTED', 'SUPERSEDED', 'VOID'];

const MdrDocumentsPage = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'delete' | 'status' | null>(null);
  const [bulkStatus, setBulkStatus] = useState('APPROVED');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<{ id: string; filename: string } | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedQuery(value), 400);
  }, []);

  useEffect(() => () => { if (searchTimer.current) clearTimeout(searchTimer.current); }, []);

  // Reset selection when scope changes
  useEffect(() => { setSelectedIds(new Set()); }, [selectedSectionId, debouncedQuery]);

  const { data: projectData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}` : null,
    fetcher
  );

  const { data: sectionsData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}/sections` : null,
    fetcher
  );

  const { data: searchData, isLoading: searchLoading } = useSWR(
    team?.slug && mdrId && debouncedQuery
      ? `/api/teams/${team.slug}/mdr/${mdrId}/search?q=${encodeURIComponent(debouncedQuery)}`
      : null,
    fetcher
  );

  const { data: docsData, mutate: mutateDocs } = useSWR(
    team?.slug && mdrId && !debouncedQuery
      ? `/api/teams/${team.slug}/mdr/${mdrId}/documents${selectedSectionId ? `?sectionId=${selectedSectionId}` : ''}`
      : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPanel message={isError.message} />;
  if (!team) return <ErrorPanel message={t('team-not-found')} />;

  const project = projectData?.data;
  const sections = sectionsData?.data ?? [];
  const docs: any[] = debouncedQuery ? (searchData?.data ?? []) : (docsData?.data ?? []);

  const allSelected = docs.length > 0 && docs.every((d) => selectedIds.has(d.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(docs.map((d) => d.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkSubmit = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const body: any = { action: bulkAction, docIds: Array.from(selectedIds) };
      if (bulkAction === 'status') body.status = bulkStatus;
      const res = await fetch(`/api/teams/${team.slug}/mdr/${mdrId}/documents/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      toast.success(bulkAction === 'delete' ? 'Documents deleted' : 'Status updated');
      setSelectedIds(new Set());
      setBulkAction(null);
      mutateDocs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <MdrNavTabs
        activeTab="documents"
        teamSlug={team.slug}
        mdrId={mdrId}
        projectName={project?.name}
      />

      <div className="flex gap-6">
        {/* Section filter sidebar */}
        <div className="w-48 shrink-0">
          <h3 className="font-medium text-sm mb-2">Sections</h3>
          <ul className="menu menu-compact bg-base-200 rounded-lg p-2">
            <li>
              <button
                className={!selectedSectionId ? 'active' : ''}
                onClick={() => setSelectedSectionId(null)}
              >
                All Documents
              </button>
            </li>
            {sections.map((section: any) => (
              <li key={section.id}>
                <button
                  className={selectedSectionId === section.id ? 'active' : ''}
                  onClick={() => setSelectedSectionId(section.id)}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Document table + uploader */}
        <div className="flex-1 space-y-4">
          {selectedSectionId && (
            <MdrDocumentUploader
              teamSlug={team.slug}
              mdrId={mdrId}
              sectionId={selectedSectionId}
              onUploaded={mutateDocs}
            />
          )}

          {/* Search bar */}
          <div className="flex items-center gap-2">
            <input
              type="search"
              className="input input-bordered input-sm flex-1 max-w-sm"
              placeholder="Search by title, doc number, discipline…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {debouncedQuery && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setSearchQuery(''); setDebouncedQuery(''); }}
              >
                Clear
              </button>
            )}
            {searchLoading && <span className="loading loading-spinner loading-xs" />}
          </div>

          {/* Table with bulk-select checkboxes */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="w-8">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={allSelected}
                      onChange={toggleAll}
                      disabled={docs.length === 0}
                    />
                  </th>
                  <th>Doc Number</th>
                  <th>Title</th>
                  <th>Rev</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc: any) => (
                  <tr key={doc.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedIds.has(doc.id)}
                        onChange={() => toggleOne(doc.id)}
                      />
                    </td>
                    <td className="text-sm font-mono">{doc.docNumber}</td>
                    <td>
                      <button
                        className="link link-hover text-sm text-left"
                        onClick={() =>
                          setPreviewDoc({ id: doc.id, filename: doc.originalName || doc.title })
                        }
                      >
                        {doc.title}
                      </button>
                    </td>
                    <td className="text-sm">{doc.revision ?? '0'}</td>
                    <td>
                      <span className="badge badge-sm badge-outline">{doc.status}</span>
                    </td>
                    <td className="text-sm">
                      {doc.docDate ? new Date(doc.docDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {!searchLoading && docs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-base-content/50 py-8">
                      {debouncedQuery ? 'No documents match your search' : 'No documents yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Hidden full table for edit/delete actions */}
          <MdrDocumentTable
            documents={docs}
            teamSlug={team.slug}
            mdrId={mdrId}
            onUpdate={mutateDocs}
          />
        </div>
      </div>

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-base-100 border border-base-300 shadow-xl rounded-xl px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          {bulkAction === 'status' ? (
            <>
              <select
                className="select select-sm select-bordered"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleBulkSubmit}
                disabled={bulkLoading}
              >
                {bulkLoading ? <span className="loading loading-spinner loading-xs" /> : 'Apply'}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setBulkAction(null)}>
                Cancel
              </button>
            </>
          ) : bulkAction === 'delete' ? (
            <>
              <span className="text-sm text-error">
                Delete {selectedIds.size} document{selectedIds.size !== 1 ? 's' : ''}?
              </span>
              <button
                className="btn btn-sm btn-error"
                onClick={handleBulkSubmit}
                disabled={bulkLoading}
              >
                {bulkLoading ? <span className="loading loading-spinner loading-xs" /> : 'Confirm Delete'}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setBulkAction(null)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-outline" onClick={() => setBulkAction('status')}>
                Change Status
              </button>
              <button
                className="btn btn-sm btn-error btn-outline"
                onClick={() => setBulkAction('delete')}
              >
                Delete
              </button>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setSelectedIds(new Set())}
              >
                Deselect
              </button>
            </>
          )}
        </div>
      )}

      {/* Document preview modal */}
      {previewDoc && (
        <MdrDocumentPreview
          docId={previewDoc.id}
          mdrId={mdrId}
          teamSlug={team.slug}
          filename={previewDoc.filename}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  if (!env.teamFeatures.mdr) {
    return { notFound: true };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default MdrDocumentsPage;
