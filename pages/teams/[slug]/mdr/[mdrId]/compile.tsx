import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import { Button } from 'react-daisyui';
import { ArrowDownTrayIcon, PlayIcon } from '@heroicons/react/24/outline';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'badge-warning',
    PROCESSING: 'badge-info',
    COMPLETE: 'badge-success',
    FAILED: 'badge-error',
  };
  return map[status] ?? 'badge-neutral';
};

const MdrCompilePage = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();

  const { data: projectData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}` : null,
    fetcher
  );

  const {
    data: compilationsData,
    mutate: mutateCompilations,
  } = useSWR(
    team?.slug && mdrId
      ? `/api/teams/${team.slug}/mdr/${mdrId}/compile`
      : null,
    fetcher,
    { refreshInterval: 5000 } // poll every 5s for status updates
  );

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!team) return <Error message={t('team-not-found')} />;

  const project = projectData?.data;
  const compilations = compilationsData?.data ?? [];

  const handleCompile = async () => {
    const res = await fetch(`/api/teams/${team.slug}/mdr/${mdrId}/compile`, {
      method: 'POST',
    });
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error?.message || 'Failed to start compilation');
      return;
    }

    toast.success('Compilation started!');
    mutateCompilations();
  };

  const handleDownload = async (compilationId: string) => {
    const res = await fetch(
      `/api/teams/${team.slug}/mdr/${mdrId}/compile/${compilationId}`
    );
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error?.message || 'Failed to get download link');
      return;
    }

    if (json.data?.downloadUrl) {
      window.open(json.data.downloadUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <MdrNavTabs
        activeTab="compile"
        teamSlug={team.slug}
        mdrId={mdrId}
        projectName={project?.name}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('mdr-compile')}</h2>
          <p className="text-sm text-gray-500">
            Compile all documents into a single PDF with a hyperlinked table of
            contents.
          </p>
        </div>
        <Button color="primary" onClick={handleCompile}>
          <PlayIcon className="h-4 w-4 mr-1" />
          Start Compilation
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Started</th>
              <th>Status</th>
              <th>Size</th>
              <th>Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {compilations.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No compilations yet. Click &quot;Start Compilation&quot; above.
                </td>
              </tr>
            ) : (
              compilations.map((c: any) => (
                <tr key={c.id}>
                  <td className="text-sm">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge badge-sm ${statusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="text-sm">
                    {c.fileSize
                      ? `${(Number(c.fileSize) / 1024 / 1024).toFixed(1)} MB`
                      : '—'}
                  </td>
                  <td className="text-sm">
                    {c.completedAt
                      ? new Date(c.completedAt).toLocaleString()
                      : '—'}
                  </td>
                  <td>
                    {c.status === 'COMPLETE' && (
                      <Button
                        size="xs"
                        color="ghost"
                        onClick={() => handleDownload(c.id)}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {c.status === 'FAILED' && (
                      <span className="text-xs text-error" title={c.errorMessage}>
                        Error
                      </span>
                    )}
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

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
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

export default MdrCompilePage;
