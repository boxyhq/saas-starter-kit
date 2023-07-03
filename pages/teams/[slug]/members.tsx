import { InviteMember, PendingInvitations } from '@/components/invitation';
import { Error, Loading } from '@/components/shared';
import { Members, TeamTab } from '@/components/team';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import type { NextPageWithLayout } from 'types';

const TeamMembers: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { slug } = router.query;

  const [visible, setVisible] = useState(false);

  const { isLoading, isError, team } = useTeam(slug as string);

  if (isLoading || !team) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <TeamTab activeTab="members" team={team} />
      <div className="flex flex-col">
        <div className="flex mt-4 justify-end">
          <Button
            color="primary"
            variant="outline"
            size="sm"
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
