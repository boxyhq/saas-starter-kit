import { CheckIcon } from '@heroicons/react/20/solid';
import plans from 'data/pricing.json';
import { useTranslation } from 'next-i18next';
import { Button, Card } from 'react-daisyui';

const PricingSection = () => {
  const { t } = useTranslation('common');
  return (
    <section className="py-6">
      <div className="flex flex-col justify-center space-y-6">
        <h2 className="text-center text-4xl font-bold normal-case">
          {t('pricing')}
        </h2>
        <p className="text-center text-xl">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {plans.map((plan, index) => {
              return (
                <Card key={index} className="rounded-md">
                  <Card.Body>
                    <Card.Title tag="h2">
                      {plan.currency} {plan.amount} / {plan.duration}
                    </Card.Title>
                    <p>{plan.description}</p>
                    <div className="mt-5">
                      <ul className="flex flex-col space-y-2">
                        {plan.benefits.map((benefit: string) => {
                          return (
                            <li key={index} className="flex items-center">
                              <CheckIcon className="h-5 w-5" />
                              <span className="ml-1">{benefit}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </Card.Body>
                  <Card.Actions className="justify-center">
                    <Button color="primary" className="w-full rounded-md">
                      {t('buy-now')}
                    </Button>
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

export default PricingSection;
