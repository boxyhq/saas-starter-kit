import type { NextPageWithLayout } from 'types';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';
import { UpdateAccount } from '@/components/account';
import env from '@/lib/env';

type AccountProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Account: NextPageWithLayout<AccountProps> = ({
  user,
  allowEmailChange,
}) => {
  return <UpdateAccount user={user} allowEmailChange={allowEmailChange} />;
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      allowEmailChange: env.confirmEmail === false,
    },
  };
};

export default Account;
