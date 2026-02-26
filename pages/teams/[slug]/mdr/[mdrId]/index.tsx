import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error as ErrorPanel, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';

const MdrProjectDashboard = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();

  const { data } = useSWR(
    team?.slug && mdrId
      ? `/api/teams/${team.slug}/mdr/${mdrId}`
      : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPanel message={isError.message} />;
  if (!team) return <ErrorPanel message={t('team-not-found')} />;

  const project = data?.data;

  if (!project) return <Loading />;

  return (
    <div className="space-y-6">
      <MdrNavTabs
        activeTab="overview"
        teamSlug={team.slug}
        mdrId={mdrId}
        projectName={project.name}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-title">Sections</div>
          <div className="stat-value text-primary">
            {project._count?.sections ?? 0}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-title">Members</div>
          <div className="stat-value text-secondary">
            {project._count?.members ?? 0}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-title">Compilations</div>
          <div className="stat-value text-accent">
            {project._count?.compilations ?? 0}
          </div>
        </div>
      </div>

      <div className="bg-base-200 rounded-lg p-4">
        <h2 className="font-semibold mb-2">Project Details</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {project.clientName && (
            <>
              <dt className="text-gray-500">Client</dt>
              <dd>{project.clientName}</dd>
            </>
          )}
          {project.projectNumber && (
            <>
              <dt className="text-gray-500">Project Number</dt>
              <dd>{project.projectNumber}</dd>
            </>
          )}
          {project.discipline && (
            <>
              <dt className="text-gray-500">Discipline</dt>
              <dd>{project.discipline}</dd>
            </>
          )}
          <dt className="text-gray-500">Status</dt>
          <dd>
            <span
              className={`badge badge-sm ${
                project.status === 'ACTIVE'
                  ? 'badge-success'
                  : project.status === 'ARCHIVED'
                  ? 'badge-warning'
                  : 'badge-neutral'
              }`}
            >
              {t(`mdr-project-${project.status.toLowerCase()}`)}
            </span>
          </dd>
        </dl>
      </div>

      {project.compilations?.[0] && (
        <div className="bg-base-200 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Latest Compilation</h2>
          <div className="flex items-center gap-2">
            <span
              className={`badge ${
                project.compilations[0].status === 'COMPLETE'
                  ? 'badge-success'
                  : project.compilations[0].status === 'FAILED'
                  ? 'badge-error'
                  : 'badge-warning'
              }`}
            >
              {project.compilations[0].status}
            </span>
            {project.compilations[0].completedAt && (
              <span className="text-sm text-gray-500">
                {new Date(
                  project.compilations[0].completedAt
                ).toLocaleDateString()}
              </span>
            )}
            {project.compilations[0].status === 'COMPLETE' && (
              <Link
                href={`/teams/${team.slug}/mdr/${mdrId}/compile`}
                className="link link-primary text-sm"
              >
                Download
              </Link>
            )}
          </div>
        </div>
      )}
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

export default MdrProjectDashboard;
