import { CreateConnection } from '@/components/saml';
import { Alert, Error, Loading } from '@/components/shared';
import { Card } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { TeamTab } from '@/components/team';
import { ConnectionList } from '@boxyhq/react-ui/sso';
import type { SAMLSSORecord } from '@boxyhq/saml-jackson';
import useSAMLConfig from 'hooks/useSAMLConfig';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { toast } from 'react-hot-toast';
import type { ApiResponse, NextPageWithLayout } from 'types';

const TeamSSO: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);
  const [selectedSsoConnection, setSelectedSsoConnection] =
    useState<SAMLSSORecord | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const { slug } = router.query as { slug: string };

  const { isLoading, isError, team } = useTeam();
  const { samlConfig, mutateSamlConfig } = useSAMLConfig(slug);

  // Delete SSO Connection
  const deleteSsoConnection = async (connection: SAMLSSORecord | null) => {
    if (!connection) return;

    const { clientID, clientSecret } = connection;
    const params = new URLSearchParams({
      clientID,
      clientSecret,
    });

    const res = await fetch(`/api/teams/${slug}/saml?${params}`, {
      method: 'DELETE',
    });

    const { data, error } = (await res.json()) as ApiResponse<null>;

    setSelectedSsoConnection(null);
    setConfirmationDialogVisible(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      mutateSamlConfig();
      toast.success(t('sso-connection-deleted'));
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  const connectionsAdded = samlConfig && samlConfig.length > 0;

  return (
    <>
      <TeamTab activeTab="saml" team={team} />
      {connectionsAdded && (
        <div className="flex flex-col">
          <div className="flex mt-2 justify-end">
            <Button
              color="primary"
              onClick={() => {
                setVisible(!visible);
              }}
              size="sm"
              variant="outline"
            >
              {t('add-connection')}
            </Button>
          </div>
          <ConnectionList
            tableCaption={t('team-connections')}
            classNames={{
              tableContainer: 'mt-6 border',
            }}
            getConnectionsUrl={`/api/teams/${slug}/saml`}
            hideCols={['tenant', 'product']}
            onActionClick={function () {}}
          />
        </div>
      )}
      <Card heading={t('configure-singlesignon')}>
        <Card.Body className="px-3 py-3 text-sm">
          {!connectionsAdded && (
            <div className="mb-3 flex items-center justify-between">
              <p>{t('allow-team')}</p>
              <Button
                onClick={() => setVisible(!visible)}
                variant="outline"
                size="sm"
                color="primary"
              >
                {t('configure')}
              </Button>
            </div>
          )}
          {connectionsAdded && (
            <>
              <Alert status="success">{t('saml-connection-established')}</Alert>
              <div className="flex flex-col justify-between space-y-2 mt-4">
                <p>
                  {t('identity-provider-setup')}{' '}
                  <Link
                    href="/.well-known/saml-configuration"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                    target="_blank"
                  >
                    .well-known/saml-configuration
                  </Link>
                  .
                </p>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
      <CreateConnection team={team} visible={visible} setVisible={setVisible} />
      <ConfirmationDialog
        title={t('delete-sso-connection')}
        visible={confirmationDialogVisible}
        onConfirm={() => deleteSsoConnection(selectedSsoConnection)}
        onCancel={() => setConfirmationDialogVisible(false)}
        cancelText={t('cancel')}
        confirmText={t('delete-sso-connection')}
      >
        {t('delete-sso-connection-confirmation')}
      </ConfirmationDialog>
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

export default TeamSSO;
