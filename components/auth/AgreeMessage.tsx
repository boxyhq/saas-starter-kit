import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const AgreeMessage = ({ text }) => {
  const { t } = useTranslation('common');

  return (
    <p className="text-sm text-center">
      {t('agree-message-part', { button: text })}{' '}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={process.env.NEXT_PUBLIC_TERMS_URL || '/terms'}
        className="font-medium text-primary hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
      >
        {t('terms')}
      </Link>{' '}
      {t('and')}{' '}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={process.env.NEXT_PUBLIC_PRIVACY_URL || '/privacy'}
        className="font-medium text-primary hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
      >
        {t('privacy')}
      </Link>
    </p>
  );
};

export default AgreeMessage;
