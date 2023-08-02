import { CreateTeam, Teams } from '@/components/team';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import type { NextPageWithLayout } from 'types';

const AllTeams: NextPageWithLayout = () => {
  const [visible, setVisible] = useState(false);

  const router = useRouter();
  const { t } = useTranslation('common');

  const { newTeam } = router.query as { newTeam: string };

  useEffect(() => {
    if (newTeam) {
      setVisible(true);
    }
  }, [router.query]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h4>{t('all-teams')}</h4>
        <Button
          color="primary"
          size="md"
          variant="outline"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          {t('create-team')}
        </Button>
      </div>
      <CreateTeam visible={visible} setVisible={setVisible} />
      <Teams />
    </>
  );
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default AllTeams;
