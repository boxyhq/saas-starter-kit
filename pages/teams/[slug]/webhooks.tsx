import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import { CreateWebhook, Webhooks } from '@/components/webhook';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import type { NextPageWithLayout } from 'types';

const WebhookList: NextPageWithLayout = () => {
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
      <TeamTab activeTab="webhooks" team={team} />
      <div className="flex flex-col">
        <div className="flex my-3 justify-end">
          <Button
            variant="outline"
            color="primary"
            size="md"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {t('add-webhook')}
          </Button>
        </div>
        <Webhooks team={team} />
      </div>
      <CreateWebhook visible={visible} setVisible={setVisible} team={team} />
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

export default WebhookList;
