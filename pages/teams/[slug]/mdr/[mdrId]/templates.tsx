import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error as ErrorPanel, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import { Button, Select } from 'react-daisyui';
import { CloudArrowUpIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline';

const purposeLabels: Record<string, string> = {
  COVER: 'Cover Page',
  DIVIDER: 'Section Divider',
  BODY: 'Body Page',
};

const MdrTemplatesPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [purpose, setPurpose] = useState('DIVIDER');
  const [title, setTitle] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: projectData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}` : null,
    fetcher
  );

  const { data: templatesData, mutate } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}/templates` : null,
    fetcher
  );

  const { data: sectionsData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}/sections` : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPanel message={isError.message} />;
  if (!team) return <ErrorPanel message={t('team-not-found')} />;

  const project = projectData?.data;
  const templates = templatesData?.data ?? [];
  const sections = sectionsData?.data ?? [];

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      toast.error('Please select a file and provide a title');
      return;
    }
    setUploading(true);
    try {
      // 1. Get presigned URL
      const urlRes = await fetch(`/api/teams/${team.slug}/mdr/${mdrId}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          purpose,
          mdrSectionId: sectionId || undefined,
          mimeType: selectedFile.type,
          filename: selectedFile.name,
          fileSize: selectedFile.size,
          requestUploadUrl: true,
        }),
      });
      const urlJson = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlJson.error?.message || 'Failed to get upload URL');

      const { uploadUrl, templateId } = urlJson.data;

      // 2. Upload file
      await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type },
      });

      // 3. Confirm upload
      await fetch(`/api/teams/${team.slug}/mdr/${mdrId}/templates/${templateId}/confirm`, {
        method: 'POST',
      });

      toast.success('Template uploaded!');
      setSelectedFile(null);
      setTitle('');
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    setDeleting(templateId);
    try {
      const res = await fetch(`/api/teams/${team.slug}/mdr/${mdrId}/templates/${templateId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to delete');
      }
      toast.success('Template deleted');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <MdrNavTabs
        activeTab="templates"
        teamSlug={team.slug}
        mdrId={mdrId}
        projectName={project?.name}
      />

      <div>
        <h2 className="text-lg font-semibold">{t('mdr-templates')}</h2>
        <p className="text-sm text-base-content/60">
          Upload PDF page templates for cover pages and section dividers. Used during MDR compilation.
        </p>
      </div>

      {/* Upload form */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body space-y-4">
          <h3 className="font-semibold">Upload Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Title *</span></label>
              <input
                className="input input-bordered"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Section Divider v2"
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Purpose</span></label>
              <Select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                {Object.entries(purposeLabels).map(([k, v]) => (
                  <Select.Option key={k} value={k}>{v}</Select.Option>
                ))}
              </Select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Section (optional)</span></label>
              <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                <Select.Option value="">All sections (project-level)</Select.Option>
                {sections.map((s: any) => (
                  <Select.Option key={s.id} value={s.id}>{s.title}</Select.Option>
                ))}
              </Select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">File (PDF) *</span></label>
              <input
                type="file"
                accept="application/pdf"
                className="file-input file-input-bordered file-input-sm"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              color="primary"
              size="sm"
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !title}
              loading={uploading}
            >
              <CloudArrowUpIcon className="h-4 w-4 mr-1" /> Upload Template
            </Button>
          </div>
        </div>
      </div>

      {/* Template list */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Purpose</th>
              <th>Section</th>
              <th>Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-base-content/50 py-8">
                  No templates yet.
                </td>
              </tr>
            ) : (
              templates.map((tmpl: any) => (
                <tr key={tmpl.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <DocumentIcon className="h-4 w-4 text-base-content/40" />
                      <span className="font-medium">{tmpl.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-sm badge-ghost">{purposeLabels[tmpl.purpose] ?? tmpl.purpose}</span>
                  </td>
                  <td className="text-sm text-base-content/60">
                    {tmpl.mdrSection?.title ?? 'All sections'}
                  </td>
                  <td className="text-sm">
                    {(Number(tmpl.fileSize) / 1024).toFixed(0)} KB
                  </td>
                  <td>
                    <Button
                      size="xs"
                      color="ghost"
                      onClick={() => handleDelete(tmpl.id)}
                      disabled={deleting === tmpl.id}
                      loading={deleting === tmpl.id}
                    >
                      <TrashIcon className="h-4 w-4 text-error" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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

export default MdrTemplatesPage;
