import { InviteMember, PendingInvitations } from '@/components/invitation';
import { Error, Loading } from '@/components/shared';
import { Members, TeamTab } from '@/components/team';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import type { NextPageWithLayout } from 'types';

const TeamMembers: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);
  const { isLoading, isError, team } = useTeam();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <>
      <TeamTab activeTab="members" team={team} />
      <div className="flex flex-col">
        <div className="flex mt-4 justify-end">
          <Button
            color="primary"
            variant="outline"
            size="md"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {t('add-member')}
          </Button>
        </div>
        <Members team={team} />
      </div>
      <PendingInvitations team={team} />
      <InviteMember visible={visible} setVisible={setVisible} team={team} />
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

export default TeamMembers;
