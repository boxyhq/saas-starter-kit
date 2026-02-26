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
import MdrProjectCard from '@/components/mdr/MdrProjectCard';
import { Button } from 'react-daisyui';
import { PlusIcon } from '@heroicons/react/24/outline';

const MdrProjectsPage = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isLoading, isError, team } = useTeam();

  const { data, mutate } = useSWR(
    team?.slug ? `/api/teams/${team.slug}/mdr` : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPanel message={isError.message} />;
  if (!team) return <ErrorPanel message={t('team-not-found')} />;

  const projects = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('mdr-projects')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage Master Document Register projects for your team.
          </p>
        </div>
        <Link href={`/teams/${team.slug}/mdr/new`}>
          <Button color="primary" size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            {t('mdr-new-project')}
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">No MDR projects yet.</p>
          <Link href={`/teams/${team.slug}/mdr/new`}>
            <Button color="primary">
              <PlusIcon className="h-4 w-4 mr-1" />
              {t('mdr-new-project')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => (
            <MdrProjectCard
              key={project.id}
              project={project}
              teamSlug={team.slug}
            />
          ))}
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

export default MdrProjectsPage;
