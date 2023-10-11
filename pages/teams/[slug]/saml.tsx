import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import { ConnectionsWrapper } from '@boxyhq/react-ui/sso';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';
import styles from 'styles/sdk-override.module.css';

const EDIT_SSO_CSS = {
  button: { ctoa: 'btn-primary', destructive: 'btn-error' },
  input: `${styles['sdk-input']} input input-bordered`,
  confirmationPrompt: {
    button: {
      ctoa: 'btn-md',
      cancel: 'btn-md btn-outline',
    },
  },
  secretInput: 'input input-bordered',
  section: 'mb-8',
};

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
        classNames={{ button: { ctoa: 'btn-primary' } }}
        componentProps={{
          editOIDCConnection: {
            classNames: EDIT_SSO_CSS,
          },
          editSAMLConnection: {
            urls: {
              patch: `/api/teams/${team.slug}/saml`,
              delete: `/api/teams/${team.slug}/saml`,
            },
            classNames: EDIT_SSO_CSS,
          },
          connectionList: {
            cols: ['provider', 'type', 'status', 'actions'],
            getConnectionsUrl: `/api/teams/${team.slug}/saml`,
          },
          createSSOConnection: {
            componentProps: {
              saml: {
                variant: 'basic',
                urls: {
                  save: `/api/teams/${team.slug}/saml`,
                },
                classNames: {
                  input: styles['sdk-input'],
                  button: { ctoa: 'btn-primary' },
                },
              },
              oidc: {
                variant: 'basic',
                urls: {
                  save: '',
                },
                classNames: {
                  input: styles['sdk-input'],
                  button: { ctoa: 'btn-primary' },
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
