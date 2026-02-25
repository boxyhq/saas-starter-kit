import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import MdrDocumentTable from '@/components/mdr/MdrDocumentTable';
import MdrDocumentUploader from '@/components/mdr/MdrDocumentUploader';

const MdrDocumentsPage = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const { data: projectData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}` : null,
    fetcher
  );

  const { data: sectionsData } = useSWR(
    team?.slug && mdrId
      ? `/api/teams/${team.slug}/mdr/${mdrId}/sections`
      : null,
    fetcher
  );

  const {
    data: docsData,
    mutate: mutateDocs,
  } = useSWR(
    team?.slug && mdrId
      ? `/api/teams/${team.slug}/mdr/${mdrId}/documents${selectedSectionId ? `?sectionId=${selectedSectionId}` : ''}`
      : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!team) return <Error message={t('team-not-found')} />;

  const project = projectData?.data;
  const sections = sectionsData?.data ?? [];
  const docs = docsData?.data ?? [];

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
          <MdrDocumentTable
            documents={docs}
            teamSlug={team.slug}
            mdrId={mdrId}
            onUpdate={mutateDocs}
          />
        </div>
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

export default MdrDocumentsPage;
