import { CheckIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'next-i18next';
import { Button, Card } from 'react-daisyui';

import plans from './data/pricing.json';

const PricingSection = () => {
  const { t } = useTranslation('common');
  return (
    <section className="py-6">
      <div className="flex flex-col justify-center space-y-6">
        <h2 className="text-center text-4xl font-bold normal-case">
          {t('pricing')}
        </h2>
        <p className="text-center text-xl mb-8 mx-4">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>
        <div className="flex items-center  justify-center">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {plans.map((plan, index) => {
              return (
                <Card
                  key={`plan-${index}`}
                  className="rounded-md dark:border-gray-200 mb-5 border border-gray-400 transform transition-transform duration-400 hover:scale-105 hover:shadow-lg hover:bg-[#2563eb] "
                >
                  {' '}
                  <Card.Body className="transition-colors duration-400 hover:text-white">
                    <Card.Title tag="h2">
                      {plan.currency} {plan.amount} / {plan.duration}
                    </Card.Title>
                    <p>{plan.description}</p>
                    <div className="mt-5">
                      <ul className="flex flex-col space-y-2">
                        {plan.benefits.map(
                          (benefit: string, itemIndex: number) => {
                            return (
                              <li
                                key={`plan-${index}-benefit-${itemIndex}`}
                                className="flex items-center"
                              >
                                <CheckIcon className="h-5 w-5" />
                                <span className="ml-1">{benefit}</span>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    </div>
                  </Card.Body>
                  <Card.Actions className="justify-center m-2">
                    <Button
                      className="md:w-full bg-white border-[1px] border-gray-400 text-black font-semibold  w-3/4 rounded-lg"
                      size="md"
                    >
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

