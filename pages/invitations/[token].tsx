import { AuthLayout } from '@/components/layouts';
import { Error, Loading } from '@/components/ui';
import axios from 'axios';
import { setCookie } from 'cookies-next';
import useInvitation from 'hooks/useInvitation';
import type { GetServerSidePropsContext } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';

const AcceptTeamInvitation: NextPageWithLayout = () => {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');

  const { token } = router.query;

  const { isLoading, isError, invitation } = useInvitation(token as string);

  if (isLoading || !invitation) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const acceptInvitation = async () => {
    const response = await axios.put(
      `/api/teams/${invitation.team.slug}/invitations`,
      {
        inviteToken: invitation.token,
      }
    );

    const { data, error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      router.push('/teams/switch');
    }
  };

  return (
    <>
      <div className="rounded-md bg-white p-6 shadow-sm">
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
                color="secondary"
                variant="outline"
                fullWidth
                onClick={() => {
                  router.push(`/auth/join`);
                }}
              >
                {t('create-a-new-account')}
              </Button>
              <Button
                color="secondary"
                variant="outline"
                fullWidth
                onClick={() => {
                  router.push(`/auth/login`);
                }}
              >
                {t('login')}
              </Button>
            </>
          ) : (
            <Button onClick={acceptInvitation} fullWidth color="primary">
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
