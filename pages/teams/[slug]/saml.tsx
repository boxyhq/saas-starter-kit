import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import { ConnectionsWrapper } from '@boxyhq/react-ui/sso';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from 'styles/sdk-override.module.css';
import env from '@/lib/env';
import { useRouter } from 'next/router';

const CREATE_SSO_CSS = {
  input: `${styles['sdk-input']} input input-bordered`,
  button: { ctoa: 'btn-primary' },
  textarea: styles['sdk-input'],
};

const EDIT_SSO_CSS = {
  button: { ctoa: 'btn-primary', destructive: 'btn-error' },
  input: `${styles['sdk-input']} input input-bordered`,
  textarea: styles['sdk-input'],
  confirmationPrompt: {
    button: {
      ctoa: 'btn-md',
      cancel: 'btn-md btn-outline',
    },
  },
  secretInput: 'input input-bordered',
  section: 'mb-8',
};

const TeamSSO = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const router = useRouter();

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
      <TeamTab activeTab="saml" team={team} teamFeatures={teamFeatures} />
      <ConnectionsWrapper
        urls={{ spMetadata: '/well-known/saml-configuration' }}
        copyDoneCallback={() => {
          /** show toast */
        }}
        classNames={{ button: { ctoa: 'btn-primary' } }}
        componentProps={{
          editOIDCConnection: {
            classNames: EDIT_SSO_CSS,
            successCallback({ operation }) {
              if (operation === 'UPDATE') {
                toast.success('OIDC connection updated successfully.');
              } else if (operation === 'DELETE') {
                toast.success('OIDC connection deleted successfully.');
              }
              router.push(`/teams/${team.slug}/saml`);
            },
            errorCallback: (message) => {
              toast.error(message);
            },
          },
          editSAMLConnection: {
            urls: {
              patch: `/api/teams/${team.slug}/saml`,
              delete: `/api/teams/${team.slug}/saml`,
            },
            classNames: EDIT_SSO_CSS,
            successCallback({ operation }) {
              if (operation === 'UPDATE') {
                toast.success('SAML connection updated successfully.');
              } else if (operation === 'DELETE') {
                toast.success('SAML connection deleted successfully.');
              }
              router.push(`/teams/${team.slug}/saml`);
            },
            errorCallback: (message) => {
              toast.error(message);
            },
          },
          connectionList: {
            cols: ['provider', 'type', 'status', 'actions'],
            urls: { get: `/api/teams/${team.slug}/saml` },
          },
          createSSOConnection: {
            componentProps: {
              saml: {
                variant: 'basic',
                urls: {
                  save: `/api/teams/${team.slug}/saml`,
                },
                classNames: CREATE_SSO_CSS,
                errorCallback: (message) => {
                  toast.error(message);
                },
                successCallback() {
                  toast.success('SAML connection created successfully.');
                  router.push(`/teams/${team.slug}/saml`);
                },
              },
              oidc: {
                variant: 'basic',
                urls: {
                  save: '',
                },
                classNames: CREATE_SSO_CSS,
                errorCallback: (message) => {
                  toast.error(message);
                },
                successCallback() {
                  toast.success('OIDC connection created successfully.');
                  router.push(`/teams/${team.slug}/saml`);
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
  if (!env.teamFeatures.sso) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default TeamSSO;
