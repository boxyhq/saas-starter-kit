import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error as ErrorPanel, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';

const ACTION_LABELS: Record<string, string> = {
  project_created: 'Project created',
  project_updated: 'Project updated',
  project_finalized: 'Project finalized',
  section_created: 'Section created',
  section_updated: 'Section updated',
  section_deleted: 'Section deleted',
  document_uploaded: 'Document uploaded',
  document_updated: 'Document updated',
  document_deleted: 'Document deleted',
  document_version_restored: 'Document version restored',
  transmittal_created: 'Transmittal created',
  transmittal_issued: 'Transmittal issued',
  share_link_created: 'Share link created',
  compilation_triggered: 'Compilation triggered',
  member_invited: 'Member invited',
  member_removed: 'Member removed',
  inbox_email_routed: 'Inbox email routed',
};

const MdrActivityPage = ({ teamFeatures }: { teamFeatures: any }) => {
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading: teamLoading, isError: teamError, team } = useTeam();

  const { data: projectData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}` : null,
    fetcher
  );

  const { data, isLoading, error } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}/activity` : null,
    fetcher
  );

  const project = projectData?.data;
  const logs = data?.data?.logs ?? [];

  if (teamLoading) return <Loading />;
  if (teamError) return <ErrorPanel message="Failed to load team" />;

  return (
    <div className="space-y-4">
      <MdrNavTabs teamSlug={team?.slug ?? ''} mdrId={mdrId} activeTab="activity" />

      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">
          Activity Log
          {project && <span className="text-base-content/50 font-normal ml-2">— {project.name}</span>}
        </h2>

        {isLoading && <Loading />}
        {error && <ErrorPanel message={error.message} />}

        {!isLoading && logs.length === 0 && (
          <p className="text-base-content/50 text-sm">No activity recorded yet.</p>
        )}

        <ol className="relative border-l border-base-300 space-y-0">
          {logs.map((log: any) => (
            <li key={log.id} className="ml-4 pb-6">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-base-100 bg-primary/60" />
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </p>
                  {log.user && (
                    <p className="text-xs text-base-content/50">
                      by {log.user.name ?? log.user.email}
                    </p>
                  )}
                  {log.details && Object.keys(log.details).length > 0 && (
                    <pre className="text-xs text-base-content/40 mt-1 bg-base-200 rounded p-2 overflow-x-auto max-w-lg">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
                <time className="text-xs text-base-content/40 flex-shrink-0 pt-0.5">
                  {new Date(log.createdAt).toLocaleString()}
                </time>
              </div>
            </li>
          ))}
        </ol>

        {data?.data?.total > logs.length && (
          <p className="text-xs text-base-content/40 text-center mt-4">
            Showing {logs.length} of {data.data.total} entries
          </p>
        )}
      </div>
    </div>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  if (!env.teamFeatures.mdr) return { notFound: true };
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default MdrActivityPage;
