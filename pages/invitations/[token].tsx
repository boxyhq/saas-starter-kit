import Head from 'next/head';
import { ReactElement } from 'react';
import { NextPageWithLayout } from 'types';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import useInvitation from 'hooks/useInvitation';
import { AuthLayout } from '@/components/layouts';
import { Error, Loading } from '@/components/shared';
import { extractEmailDomain } from '@/lib/email/utils';
import EmailMismatch from '@/components/invitation/EmailMismatch';
import AcceptInvitation from '@/components/invitation/AcceptInvitation';
import NotAuthenticated from '@/components/invitation/NotAuthenticated';
import EmailDomainMismatch from '@/components/invitation/EmailDomainMismatch';

const AcceptTeamInvitation: NextPageWithLayout = () => {
  const { status, data } = useSession();
  const { t } = useTranslation('common');
  const { isLoading, error, invitation } = useInvitation();

  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return <Error message={error.message} />;
  }

  const authUser = data?.user;

  const emailDomain = authUser?.email
    ? extractEmailDomain(authUser.email)
    : null;

  const emailMatch = invitation.email
    ? authUser?.email === invitation.email
    : false;

  const emailDomainMatch = invitation.allowedDomains.length
    ? invitation.allowedDomains.includes(emailDomain!)
    : true;

  const acceptInvite = invitation.sentViaEmail ? emailMatch : emailDomainMatch;

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
            <NotAuthenticated invitation={invitation} />
          )}

          {/* User authenticated and email matches */}
          {status === 'authenticated' && acceptInvite && (
            <AcceptInvitation invitation={invitation} />
          )}

          {/* User authenticated and email does not match */}
          {status === 'authenticated' &&
            invitation.sentViaEmail &&
            authUser?.email &&
            !emailMatch && <EmailMismatch email={authUser.email} />}

          {/* User authenticated and email domain doesn not match */}
          {status === 'authenticated' &&
            !invitation.sentViaEmail &&
            invitation.allowedDomains.length > 0 &&
            !emailDomainMatch && (
              <EmailDomainMismatch
                invitation={invitation}
                emailDomain={emailDomain!}
              />
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
