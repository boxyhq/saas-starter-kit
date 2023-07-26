import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import useTeam from 'hooks/useTeam';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { Button } from 'react-daisyui';

import APIKeys from './APIKeys';
import NewAPIKey from './NewAPIKey';

const APIKeysContainer = () => {
  const { t } = useTranslation('common');
  const [createModalVisible, setCreateModalVisible] = useState(false);
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
      <TeamTab activeTab="api-keys" team={team} />
      <div className="flex flex-col space-y-4">
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            color="primary"
            size='md'
            onClick={() => setCreateModalVisible(true)}
          >
            {t('new-api-key')}
          </Button>
        </div>
        <APIKeys team={team} />
      </div>
      <NewAPIKey
        team={team}
        createModalVisible={createModalVisible}
        setCreateModalVisible={setCreateModalVisible}
      />
    </>
  );
};

export default APIKeysContainer;
