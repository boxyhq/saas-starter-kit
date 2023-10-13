import { AuthLayout } from '@/components/layouts';
import { Error, Loading } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { setCookie } from 'cookies-next';
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

const AcceptTeamInvitation: NextPageWithLayout = () => {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');

  const { token } = router.query;

  const { isLoading, isError, invitation } = useInvitation(token as string);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!invitation) {
    return null;
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

  return (
    <>
      <Head>
        <title>{`${t('invitation-title')} ${invitation.team.name}`}</title>
      </Head>
      <div className="rounded p-6 border">
        <div className="flex flex-col items-center space-y-3">
          <h2 className="font-bold">{`${invitation.team.name} ${t(
            'team-invite'
          )}`}</h2>
          <h3 className="text-center">
            {status === 'authenticated'
              ? t('accept-invite')
              : t('invite-create-account')}
          </h3>
          {status === 'unauthenticated' ? (
            <>
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
          ) : (
            <Button
              onClick={acceptInvitation}
              fullWidth
              color="primary"
              size="md"
            >
              {t('accept-invitation')}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

AcceptTeamInvitation.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout
      heading="Accept team invite"
      description="Check out the our website if you'd like to learn more before diving in."
    >
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req, res, query, locale }: GetServerSidePropsContext = context;
  const { token } = query;

  setCookie(
    'pending-invite',
    {
      token,
      url: context.resolvedUrl,
    },
    {
      req,
      res,
      maxAge: 60 * 6 * 24,
      httpOnly: true,
      sameSite: 'lax',
    }
  );

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default AcceptTeamInvitation;
