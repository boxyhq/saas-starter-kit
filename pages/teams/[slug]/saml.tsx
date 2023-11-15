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

const SSO_CSS = {
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

const TeamSSO = ({ teamFeatures, baseURL }) => {
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
      <TeamTab activeTab="saml" team={team} teamFeatures={teamFeatures} />
      <ConnectionsWrapper
        urls={{
          spMetadata: `${baseURL}/well-known/saml-configuration`,
          get: `${baseURL}/api/teams/${team.slug}/saml`,
          post: `${baseURL}/api/teams/${team.slug}/saml`,
          patch: `${baseURL}/api/teams/${team.slug}/saml`,
          delete: `${baseURL}/api/teams/${team.slug}/saml`,
        }}
        successCallback={({
          operation,
          connectionIsSAML,
          connectionIsOIDC,
        }) => {
          const ssoType = connectionIsSAML
            ? 'SAML'
            : connectionIsOIDC
              ? 'OIDC'
              : '';
          if (operation === 'CREATE') {
            toast.success(`${ssoType} connection created successfully.`);
          } else if (operation === 'UPDATE') {
            toast.success(`${ssoType} connection updated successfully.`);
          } else if (operation === 'DELETE') {
            toast.success(`${ssoType} connection deleted successfully.`);
          } else if (operation === 'COPY') {
            toast.success(`Contents copied to clipboard`);
            return;
          }
        }}
        errorCallback={(errMessage) => toast.error(errMessage)}
        classNames={SSO_CSS}
        componentProps={{
          connectionList: {
            cols: ['provider', 'type', 'status', 'actions'],
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

  const baseURL = env.jackson.selfHosted ? env.jackson.url : '';

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
      baseURL,
    },
  };
}

export default TeamSSO;
