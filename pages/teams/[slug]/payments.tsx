import { Error, Loading } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';
import { Button, Card } from 'react-daisyui';
import useCanAccess from 'hooks/useCanAccess';
import { TeamTab } from '@/components/team';
import { useState } from 'react';
import router from 'next/router';
import fetcher from '@/lib/fetcher';
import useSWR from 'swr';
import ProductPricing from '@/components/payments/productPricing';
import toast from 'react-hot-toast';

const Payments = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { isLoading, isError, team } = useTeam();
  const { data } = useSWR(
    team?.slug ? `/api/teams/${team?.slug}/payments/products` : null,
    fetcher
  );
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
      toast.error(`${t('error-occurred')}`);
    }
    return res.json();
  };

  const redirectToCustomerPortal = async () => {
    try {
      const { url } = await postData({
        url: `/api/teams/${team?.slug}/payments/create-portal-link`,
      });
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
      {canAccess('team_payments', ['read']) && (
        <>
          <TeamTab
            activeTab="payments"
            team={team}
            teamFeatures={teamFeatures}
          />
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
          <div>
            {(data?.data?.subscriptions || []).length > 0 && (
              <>
                <div className="divider"></div>
                <div className="m-1">
                  <h2 className="text-2xl font-bold">{t('subscriptions')}</h2>
                </div>
              </>
            )}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {data?.data?.subscriptions?.map((s, i) => (
                    <Card key={`${i}`} className="p-1">
                      <Card.Body>
                        <Card.Title tag="h2">{s.product.name} </Card.Title>
                        <div className="mt-1">
                          {t('from')}{' '}
                          {new Date(s.startDate).toLocaleDateString()}
                        </div>
                        <div className="mt-1">
                          {t('to')} {new Date(s.endDate).toLocaleDateString()}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <ProductPricing
            plans={data?.data?.products || []}
            disabledPrices={(data?.data?.subscriptions || []).map(
              (s) => s.price.id
            )}
          />
        </>
      )}
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
