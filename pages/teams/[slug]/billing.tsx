import { Error, Loading } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';
import { Card } from 'react-daisyui';
import useCanAccess from 'hooks/useCanAccess';
import { TeamTab } from '@/components/team';
import fetcher from '@/lib/fetcher';
import useSWR from 'swr';
import ProductPricing from '@/components/billing/ProductPricing';
import LinkToPortal from '@/components/billing/LinkToPortal';
import Help from '@/components/billing/Help';

const Payments = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { isLoading, isError, team } = useTeam();
  const { data } = useSWR(
    team?.slug ? `/api/teams/${team?.slug}/payments/products` : null,
    fetcher
  );

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
          <div className="flex gap-4">
            <LinkToPortal team={team} />
            <Help />
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
  if (!env.teamFeatures.payments) {
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
