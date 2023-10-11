import app from '@/lib/app';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  heading?: string;
  description?: string;
}

export default function AuthLayout({
  children,
  heading,
  description,
}: AuthLayoutProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('heading')}</title>
      </Head>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ">
        <div className="w-full max-w-md space-y-4">
          <div>
            <Image
              src={app.logoUrl}
              className="mx-auto h-12 w-auto"
              alt={app.name}
              width={48}
              height={48}
            />
            {heading && (
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                {t(heading)}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-center text-gray-600 dark:text-white">
                {t(description)}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
