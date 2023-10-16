import { useTranslation } from 'next-i18next';
import { Card } from 'react-daisyui';

import faqs from './data/faq.json';

const FAQSection = () => {
  const { t } = useTranslation('common');
  return (
    <section className="py-6">
      <div className="flex flex-col justify-center space-y-6">
        <h2 className="text-center text-4xl font-bold normal-case">
          {t('frequently-asked')}
        </h2>
        <p className="text-center text-xl">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 gap-1">
            {faqs.map((faq, index) => {
              return (
                <Card key={index} className="border-2 border-zinc-500">
                  <Card.Body className="items-left">
                    <Card.Title tag="h2">Q. {faq.question}</Card.Title>
                    <p>A. {faq.answer}</p>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
