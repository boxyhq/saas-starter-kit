import { ScanResult } from '@/components/scan';
import { Error, Loading } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import useScan from 'hooks/useScan';
import type { NextPageWithLayout } from 'types';

const ScanDetails: NextPageWithLayout = () => {
  const { query, isReady } = useRouter();
  const id = isReady ? (query.id as string) : undefined;
  const { scan, isLoading, isError } = useScan(id);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!scan) {
    return <Error message="Scan not found" />;
  }

  return <ScanResult scan={scan} />;
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default ScanDetails;
