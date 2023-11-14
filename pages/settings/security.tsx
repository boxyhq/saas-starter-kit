import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import env from '@/lib/env';
import { UpdatePassword } from '@/components/account';
import ManageSessions from '@/components/account/ManageSessions';

type SecurityProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Security = ({ sessionStrategy }: SecurityProps) => {
  return (
    <div className="flex gap-10 flex-col">
      <UpdatePassword />
      {sessionStrategy === 'database' && <ManageSessions />}
    </div>
  );
};

export const getServerSideProps = async ({
  locale,
}: GetServerSidePropsContext) => {
  const { sessionStrategy } = env.nextAuth;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      sessionStrategy,
    },
  };
};

export default Security;
