import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "@/lib/session";
import { getUserBySession } from "models/user";
import { inferSSRProps } from "@/lib/inferSSRProps";
import { UpdateAccount } from "@/components/interfaces/Account";

const Account: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  user,
}) => {
  if (!user) {
    return null;
  }

  return <UpdateAccount user={user} />;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);

  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      user,
    },
  };
};

export default Account;
