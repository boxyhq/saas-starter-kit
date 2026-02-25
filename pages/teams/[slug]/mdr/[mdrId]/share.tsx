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
import { Error, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import { Button, Input, Modal, Select } from 'react-daisyui';
import {
  PlusIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const MdrSharePage = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedCompilationId, setSelectedCompilationId] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(168); // 7 days
  const [password, setPassword] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('');
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const { data: projectData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}` : null,
    fetcher
  );

  const { data: compilationsData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}/compile` : null,
    fetcher
  );

  const { data: shareLinksData, mutate } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}/share` : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!team) return <Error message={t('team-not-found')} />;

  const project = projectData?.data;
  const compilations = (compilationsData?.data ?? []).filter(
    (c: any) => c.status === 'COMPLETE'
  );
  const shareLinks = shareLinksData?.data ?? [];

  const handleCreate = async () => {
    if (!selectedCompilationId) {
      toast.error('Please select a compilation');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`/api/teams/${team.slug}/mdr/${mdrId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compilationId: selectedCompilationId,
          expiresInHours,
          password: password || undefined,
          maxDownloads: maxDownloads ? parseInt(maxDownloads) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create link');
      toast.success('Share link created!');
      setShowCreate(false);
      setPassword('');
      setMaxDownloads('');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (linkId: string) => {
    setRevoking(linkId);
    try {
      const res = await fetch(
        `/api/teams/${team.slug}/mdr/${mdrId}/share/${linkId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to revoke');
      }
      toast.success('Link revoked');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRevoking(null);
    }
  };

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/mdr/share/${token}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'));
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="space-y-6">
      <MdrNavTabs
        activeTab="share"
        teamSlug={team.slug}
        mdrId={mdrId}
        projectName={project?.name}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('mdr-share')}</h2>
          <p className="text-sm text-base-content/60">
            Create time-limited, password-protected public download links for compiled MDRs.
          </p>
        </div>
        <Button
          color="primary"
          size="sm"
          onClick={() => setShowCreate(true)}
          disabled={compilations.length === 0}
        >
          <PlusIcon className="h-4 w-4 mr-1" /> Create Share Link
        </Button>
      </div>

      {compilations.length === 0 && (
        <div className="alert alert-warning">
          <span>No completed compilations yet. Compile the MDR first before creating share links.</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Link / Token</th>
              <th>Compilation</th>
              <th>Expires</th>
              <th>Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shareLinks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-base-content/50 py-8">
                  No share links yet.
                </td>
              </tr>
            ) : (
              shareLinks.map((link: any) => {
                const expired = isExpired(link.expiresAt);
                return (
                  <tr key={link.id} className={expired ? 'opacity-50' : ''}>
                    <td>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-base-200 px-2 py-0.5 rounded">
                          {link.token.slice(0, 12)}…
                        </code>
                        {link.passwordHash && (
                          <LockClosedIcon className="h-3.5 w-3.5 text-warning" title="Password protected" />
                        )}
                        {expired && (
                          <span className="badge badge-xs badge-error">Expired</span>
                        )}
                      </div>
                    </td>
                    <td className="text-sm">
                      {new Date(link.compilation?.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-sm">
                      {new Date(link.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="text-sm">
                      {link.downloadCount}
                      {link.maxDownloads ? ` / ${link.maxDownloads}` : ''}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {!expired && (
                          <Button
                            size="xs"
                            color="ghost"
                            onClick={() => handleCopy(link.token)}
                            title="Copy link"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="xs"
                          color="ghost"
                          onClick={() => handleRevoke(link.id)}
                          disabled={revoking === link.id}
                          loading={revoking === link.id}
                          title="Revoke"
                        >
                          <TrashIcon className="h-4 w-4 text-error" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} onClickBackdrop={() => setShowCreate(false)}>
        <Modal.Header className="font-bold">Create Share Link</Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Compilation *</span></label>
            <Select value={selectedCompilationId} onChange={(e) => setSelectedCompilationId(e.target.value)}>
              <Select.Option value="">Select a compilation…</Select.Option>
              {compilations.map((c: any) => (
                <Select.Option key={c.id} value={c.id}>
                  {new Date(c.createdAt).toLocaleString()} — {c.fileSize ? `${(Number(c.fileSize) / 1024 / 1024).toFixed(1)} MB` : '?'}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Expires in (hours)</span></label>
            <Select value={String(expiresInHours)} onChange={(e) => setExpiresInHours(Number(e.target.value))}>
              <Select.Option value="24">24 hours (1 day)</Select.Option>
              <Select.Option value="72">72 hours (3 days)</Select.Option>
              <Select.Option value="168">168 hours (7 days)</Select.Option>
              <Select.Option value="720">720 hours (30 days)</Select.Option>
            </Select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Password (optional)</span></label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank for no password"
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Max downloads (optional)</span></label>
            <Input
              type="number"
              min="1"
              value={maxDownloads}
              onChange={(e) => setMaxDownloads(e.target.value)}
              placeholder="Unlimited"
            />
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button color="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button color="primary" onClick={handleCreate} disabled={creating} loading={creating}>
            Create Link
          </Button>
        </Modal.Actions>
      </Modal>
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

export default MdrSharePage;
