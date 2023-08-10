import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import { ConnectionsWrapper } from '@boxyhq/react-ui/sso';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { toast } from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';

const TeamSSO: NextPageWithLayout = () => {
  const { t } = useTranslation('common');

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

  // const connectionsAdded = samlConfig && samlConfig.length > 0;

  return (
    <>
      <TeamTab activeTab="saml" team={team} />
      {/* <EditSAMLConnection
        connection={{
          defaultRedirectUrl: 'http://localhost:3366/login/saml',
          redirectUrl: ['http://localhost:3366'],
          tenant: 'boxyhq.com',
          product: 'mocksaml',
          name: '',
          description: '',
          clientID: '7f43cbab5b82b431153f300173e31dd3c51852bc',
          clientSecret: '7b22304bd743206045e880bd8475fabff975e6aa9b669675',
          forceAuthn: false,
          metadataUrl: 'https://mocksaml.com/api/saml/metadata',
          idpMetadata: {
            sso: {
              postUrl: 'https://mocksaml.com/api/saml/sso',
              redirectUrl: 'https://mocksaml.com/api/saml/sso',
            },
            slo: {},
            entityID: 'https://saml.example.com/entityid',
            thumbprint: 'd797f3829882233d3f01e49643f6a1195f242c94',
            validTo: 'Jul  1 21:46:38 3021 GMT',
            loginType: 'idp',
            provider: 'saml.example.com',
            friendlyProviderName: null,
          },
          deactivated: false,
          // "isSystemSSO": false
        }}
        variant={'basic'}
        errorCallback={function (): void {
          // throw new Error('Function not implemented.');
        }}
        successCallback={function (): void {
          // throw new Error('Function not implemented.');
        }}
        urls={{
          delete: '',
          patch: `/api/teams/${slug}/saml`,
        }}
      /> */}
      <ConnectionsWrapper
        componentProps={{
          editOIDCConnection: {},
          editSAMLConnection: {
            urls: {
              patch: `/api/teams/${team.slug}/saml`,
              delete: `/api/teams/${team.slug}/saml`,
            },
          },
          connectionList: {
            hideCols: ['tenant', 'product'],
            getConnectionsUrl: `/api/teams/${team.slug}/saml`,
          },
          createSSOConnection: {
            componentProps: {
              saml: {
                variant: 'basic',
                urls: {
                  save: `/api/teams/${team.slug}/saml`,
                },
              },
              oidc: {
                variant: 'basic',
                urls: {
                  save: '',
                },
              },
            },
          },
        }}
      />
      {/* {connectionsAdded && (
        <div className="flex flex-col">
          <div className="flex mt-2 justify-end">
            <Button
              color="primary"
              onClick={() => {
                setVisible(!visible);
              }}
              size="md"
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
            onActionClick={() => setView('EDIT')}
          />
        </div>
      )} */}
      {/* <Card heading={t('configure-singlesignon')}>
        <Card.Body className="px-3 py-3 text-sm">
          {!connectionsAdded && (
            <div className="mb-3 flex items-center justify-between">
              <p>{t('allow-team')}</p>
              <Button
                onClick={() => setVisible(!visible)}
                variant="outline"
                size="md"
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
      </Card> */}
      {/* <CreateConnection team={team} visible={visible} setVisible={setVisible} />
      <ConfirmationDialog
        title={t('delete-sso-connection')}
        visible={confirmationDialogVisible}
        onConfirm={() => deleteSsoConnection(selectedSsoConnection)}
        onCancel={() => setConfirmationDialogVisible(false)}
        cancelText={t('cancel')}
        confirmText={t('delete-sso-connection')}
      >
        {t('delete-sso-connection-confirmation')}
      </ConfirmationDialog> */}
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
