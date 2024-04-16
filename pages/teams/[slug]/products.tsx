import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';
import { useTranslation } from 'next-i18next';

const Products: NextPageWithLayout = () => {
  const { t } = useTranslation('common');

  return (
    <div className="p-3">
      {/* Example iframe embedding a sample website */}
      <iframe
        src="https://app.windmill.dev/public/bluewind/22a8b7403d21b256f99e78a184d739ad"
        title="Product Frame"
        width="100%"
        height="500px"
        style={{ border: 'none' }}
      ></iframe>
    </div>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default Products;
