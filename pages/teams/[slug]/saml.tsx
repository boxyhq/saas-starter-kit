import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import { ConnectionsWrapper } from '@boxyhq/react-ui/sso';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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


  return (
    <>
      <TeamTab activeTab="saml" team={team} />
      <ConnectionsWrapper
        urls={{ spMetadata: '/well-known/saml-configuration' }}
        copyDoneCallback={() => {
          /** show toast */
        }}
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
