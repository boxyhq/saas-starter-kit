import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error as ErrorPanel, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import MdrSectionTree from '@/components/mdr/MdrSectionTree';
import MdrProgressBar from '@/components/mdr/MdrProgressBar';

const MdrStructurePage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();

  const {
    data: projectData,
  } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}` : null,
    fetcher
  );

  const {
    data: sectionsData,
    mutate: mutateSections,
  } = useSWR(
    team?.slug && mdrId
      ? `/api/teams/${team.slug}/mdr/${mdrId}/sections`
      : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPanel message={isError.message} />;
  if (!team) return <ErrorPanel message={t('team-not-found')} />;

  const project = projectData?.data;
  const sections = sectionsData?.data ?? [];

  return (
    <div className="space-y-6">
      <MdrNavTabs
        activeTab="structure"
        teamSlug={team.slug}
        mdrId={mdrId}
        projectName={project?.name}
      />

      <MdrProgressBar teamSlug={team.slug} mdrId={mdrId} />

      <MdrSectionTree
        sections={sections}
        teamSlug={team.slug}
        mdrId={mdrId}
        onUpdate={mutateSections}
      />
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

export default MdrStructurePage;
