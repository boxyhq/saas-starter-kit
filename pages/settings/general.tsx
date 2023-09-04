// import ThemeSettings from '@/components/account/ThemeSettings';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { NextPageWithLayout } from 'types';

const ThemeSettings = dynamic(
  () => import('@/components/account/ThemeSettings'),
  {
    ssr: false,
  }
);

const Settings: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = () => {
  return (
    <>
      <ThemeSettings />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default Settings;
