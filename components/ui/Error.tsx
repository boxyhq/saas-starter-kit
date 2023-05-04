import { useTranslation } from 'next-i18next';

interface ErrorProps {
  message?: string;
}

const Error = (props: ErrorProps) => {
  const { message } = props;
  const { t } = useTranslation('common');

  return (
    <div>
      <p>{message || t('unknown-error')}</p>
    </div>
  );
};

export default Error;
