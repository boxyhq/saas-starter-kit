import { useTranslation } from 'next-i18next';

const Error = () => {
  const { t } = useTranslation('common');
  return (
    <div>
      <p>{t('unknown-error')}</p>
    </div>
  );
};

export default Error;
