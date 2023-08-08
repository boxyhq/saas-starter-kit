import { CreateDirectory, Directory } from '@/components/directorySync';
import { Card } from '@/components/shared';
import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import useDirectory from 'hooks/useDirectory';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import type { NextPageWithLayout } from 'types';

const DirectorySync: NextPageWithLayout = () => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const [visible, setVisible] = useState(false);
  const { isLoading, isError, team } = useTeam();
  const { directories } = useDirectory(slug);
  const { t } = useTranslation('common');

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  const directory =
    directories && directories.length > 0 ? directories[0] : null;

  return (
    <>
      <TeamTab activeTab="directory-sync" team={team} />
      <Card heading="Directory Sync">
        <Card.Body className="px-3 py-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm">{t('provision')}</p>
            {directory === null ? (
              <Button
                onClick={() => setVisible(!visible)}
                variant="outline"
                color="primary"
                size="md"
              >
                {t('configure')}
              </Button>
            ) : (
              <Button
                onClick={() => setVisible(!visible)}
                variant="outline"
                color="error"
                disabled
                size="md"
              >
                {t('remove')}
              </Button>
            )}
          </div>
          <Directory team={team} />
        </Card.Body>
      </Card>
      <CreateDirectory visible={visible} setVisible={setVisible} team={team} />
    </>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default DirectorySync;
