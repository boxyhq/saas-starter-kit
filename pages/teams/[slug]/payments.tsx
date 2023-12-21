import { Error, Loading } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';
import { Button } from 'react-daisyui';
import { TeamTab } from '@/components/team';
import { useState } from 'react';
import router from 'next/router';

const Payments = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();
  const [portalLinkLoading, setPortalLinkLoading] = useState(false);

  const postData = async ({
    url,
    data,
  }: {
    url: string;
    data?: { price: any };
  }) => {
    setPortalLinkLoading(true);
    const res = await fetch(url, {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.log('Error in postData', { url, data, res });

      // throw Error(res?.statusText);
    }
    return res.json();
  };

  const redirectToCustomerPortal = async () => {
    try {
      const { url } = await postData({
        url: `/api/teams/${team?.slug}/create-portal-link`,
      });
      console.log(url);
      router.push(url);
    } catch (error) {
      if (error) return alert((error as Error).message);
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
  return (
    <>
      <TeamTab activeTab="payments" team={team} teamFeatures={teamFeatures} />
      <div className="">
        <Button
          type="button"
          color="primary"
          size="md"
          loading={portalLinkLoading}
          onClick={redirectToCustomerPortal}
        >
          {t('open-customer-portal')}
        </Button>
      </div>
    </>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  if (!env.teamFeatures.apiKey) {
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

export default Payments;
