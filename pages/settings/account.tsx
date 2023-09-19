import type { NextPageWithLayout } from 'types';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { UpdateAccount } from '@/components/account';

type AccountProps = NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
>;

const Account: AccountProps = ({ user }) => {
  return <UpdateAccount user={user} />;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);
  const { locale } = context;

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      user: JSON.parse(JSON.stringify(user)),
    },
  };
};

export default Account;