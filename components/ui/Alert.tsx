import { useTranslation } from 'next-i18next';
import React from 'react';

const Alert: React.FC<Props> = ({ variant, message }) => {
  const classes: { [key: string]: string } = {
    danger: 'bg-red-100 border-red-400 text-red-700',
    success: 'bg-green-100 border-green-400 text-green-700',
  };
  const { t } = useTranslation('common');

  return (
    <div
      className={`${classes[variant]} relative mb-4 rounded px-4 py-3`}
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <svg
          className="h-6 w-6 fill-current text-red-500"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>{t('close')}</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </span>
    </div>
  );
};

interface Props {
  message: string;
  variant: string; //"success" | "danger" | "warning" | "info";
}

export default Alert;
