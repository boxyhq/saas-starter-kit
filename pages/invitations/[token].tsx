import { AuthLayout } from '@/components/layouts';
import { Error, Loading } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import useInvitation from 'hooks/useInvitation';
import type { GetServerSidePropsContext } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse, NextPageWithLayout } from 'types';
import { signOut } from 'next-auth/react';

const AcceptTeamInvitation: NextPageWithLayout = () => {
  const { status, data } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isLoading, error, invitation } = useInvitation();

  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return <Error message={error.message} />;
  }

  const acceptInvitation = async () => {
    const response = await fetch(
      `/api/teams/${invitation.team.slug}/invitations`,
      {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify({ inviteToken: invitation.token }),
      }
    );

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    router.push('/dashboard');
  };

  const emailMatch = data?.user?.email === invitation.email;

  return (
    <>
      <Head>
        <title>{`${t('invitation-title')} ${invitation.team.name}`}</title>
      </Head>
      <div className="rounded p-6 border">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="font-bold">
            {`${invitation.team.name} ${t('team-invite')}`}
          </h2>

          {/* User not authenticated */}
          {status === 'unauthenticated' && (
            <>
              <h3 className="text-center">{t('invite-create-account')}</h3>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  router.push(`/auth/join?token=${invitation.token}`);
                }}
                size="md"
              >
                {t('create-a-new-account')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  router.push(`/auth/login?token=${invitation.token}`);
                }}
                size="md"
              >
                {t('login')}
              </Button>
            </>
          )}

          {/* User authenticated and email matches */}
          {status === 'authenticated' && emailMatch && (
            <>
              <h3 className="text-center">{t('accept-invite')}</h3>
              <Button
                onClick={acceptInvitation}
                fullWidth
                color="primary"
                size="md"
              >
                {t('accept-invitation')}
              </Button>
            </>
          )}

          {/* User authenticated and email does not match */}
          {status === 'authenticated' && !emailMatch && (
            <>
              <p className="text-sm text-center">{`Your email address ${data?.user?.email} does not match the email address this invitation was sent to.`}</p>
              <p className="text-sm text-center">
                To accept this invitation, you will need to sign out and then
                sign in or create a new account using the same email address
                used in the invitation.
              </p>
              <Button
                fullWidth
                color="error"
                size="md"
                variant="outline"
                onClick={() => {
                  signOut();
                }}
              >
                Sign out
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

AcceptTeamInvitation.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default AcceptTeamInvitation;
