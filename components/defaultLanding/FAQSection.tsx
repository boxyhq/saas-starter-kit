import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Card } from 'react-daisyui';

import faqs from './data/faq.json';

const FAQSection = () => {
  const { t } = useTranslation('common');
  const [openFAQ, setOpenFAQ] = useState(null);

  const handleToggle = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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
          <div className="grid grid-cols-1 gap-2 w-full">
            {faqs.map((faq, index) => {
              const isOpen = openFAQ === index;
              return (
                <Card
                  key={index}
                  className="border-none w-4/5 mx-auto hover:bg-[#2563eb] hover:text-white translate-x-1 duration-300 rounded-xl"
                >
                  <Card.Body className="dark:border-gray-200 border-[2px] border-gray-400 text-center items-center">
                    <Card.Title
                      tag="h2"
                      className="cursor-pointer"
                      onClick={() => handleToggle(index)}
                    >
                      Q. {faq.question}
                    </Card.Title>
                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        isOpen ? 'max-h-full' : 'max-h-0'
                      }`}
                    >
                      <p className={`${isOpen ? 'block' : 'hidden'} mt-2`}>
                        A. {faq.answer}
                      </p>
                    </div>
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
