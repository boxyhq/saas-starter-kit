import { useTranslation } from 'next-i18next';

import features from './data/features.json';

const FeatureSection = () => {
  const { t } = useTranslation('common');
  return (
    <section className="py-6 px-2">
      <div className="flex flex-col justify-center space-y-6">
        <h2 className="text-center text-4xl font-bold normal-case">
          {t('features')}
        </h2>
        <p className="text-center text-xl">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-2">
            {features.map((feature: any, index) => {
              return (
                <div
                  className="card-compact card border ml-4 border-gray-300 dark:border-gray-200 transform transition-transform duration-400 hover:scale-105 hover:bg-[#2563eb] hover:text-white "
                  key={index}
                >
                  <div className="card-body">
                    <h2 className="card-title">{feature.name}</h2>
                    <p>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;


