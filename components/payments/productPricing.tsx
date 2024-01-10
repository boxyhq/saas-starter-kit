import { CheckIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'next-i18next';
import { Button, Card } from 'react-daisyui';
import Image from 'next/image';
import useTeam from 'hooks/useTeam';
import router from 'next/router';
import toast from 'react-hot-toast';

const ProductPricing = ({
  plans,
  disabledPrices,
}: {
  plans: any[];
  disabledPrices: string[];
}) => {
  const { team } = useTeam();
  const { t } = useTranslation('common');
  const initiateCheckout = async (priceId: string, quantity?: number) => {
    const res = await fetch(
      `/api/teams/${team?.slug}/payments/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, quantity }),
      }
    );

    const data = await res.json();

    if (data?.data?.url) {
      router.push(data.data.url);
    } else {
      toast.error(
        data?.error?.message ||
          data?.error?.raw?.message ||
          t('stripe-checkout-fallback-error')
      );
    }
  };
  return (
    <section className="py-6">
      <div className="flex flex-col justify-center space-y-6">
        <h2 className="text-center text-4xl font-bold normal-case">
          {t('pricing')}
        </h2>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {plans.map((plan, index) => {
              return (
                <Card
                  key={`plan-${index}`}
                  className="rounded-md dark:border-gray-200 border border-gray-300"
                >
                  <Card.Body>
                    <Card.Title tag="h2">
                      <h2 className="mx-auto">{plan.name}</h2>
                    </Card.Title>
                    {plan.image ? (
                      <Image
                        className="mx-auto"
                        src={plan.image}
                        alt={plan.name}
                        width={100}
                        height={100}
                      />
                    ) : (
                      <div
                        style={{ width: 100, height: 100 }}
                        className="mx-auto"
                      />
                    )}
                    <p>{plan.description}</p>
                    <div className="mt-5">
                      <ul className="flex flex-col space-y-2">
                        {plan.features.map(
                          (feature: any, itemIndex: number) => {
                            return (
                              <li
                                key={`plan-${index}-benefit-${itemIndex}`}
                                className="flex items-center"
                              >
                                <CheckIcon className="h-5 w-5" />
                                <span className="ml-1">{feature}</span>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    </div>
                  </Card.Body>
                  <Card.Actions className="justify-center m-2">
                    {(plan?.prices || [])
                      .sort(
                        (a, b) => a.recurring.interval < b.recurring.interval
                      )
                      .map((price: any, priceIndex: number) => {
                        return (
                          <Button
                            key={`plan-${index}-price-${priceIndex}`}
                            color="primary"
                            className="md:w-full w-3/4 rounded-md"
                            size="md"
                            disabled={disabledPrices.includes(price.id)}
                            onClick={() => {
                              initiateCheckout(
                                price.id,
                                (price.billingScheme == 'per_unit' ||
                                  price.billingScheme == 'tiered') &&
                                  price.recurring.usage_type !== 'metered'
                                  ? 1
                                  : undefined
                              );
                            }}
                          >
                            {price?.recurring?.interval
                              ? `${
                                  price?.recurring?.interval === 'month'
                                    ? 'Monthly Plan'
                                    : 'Yearly Plan'
                                } `
                              : 'Buy Now'}
                          </Button>
                        );
                      })}
                  </Card.Actions>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPricing;
