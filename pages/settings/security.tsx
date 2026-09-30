import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';

const Security = () => {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col gap-4 rounded border p-6">
      <div>
        <h2 className="text-xl font-medium">{t('security') || 'Security'}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('manage-password-mfa') ||
            'Manage your password, two-factor authentication, passkeys, and active sessions.'}
        </p>
      </div>
      <Link href="/auth/settings">
        <Button color="primary" size="md">
          {t('manage-security-settings') || 'Manage security settings'}
        </Button>
      </Link>
    </div>
  );
};

export const getServerSideProps = async ({
  locale,
}: GetServerSidePropsContext) => {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default Security;
