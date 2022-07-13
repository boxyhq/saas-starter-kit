import type { ReactElement } from "react";
import { Typography } from "@supabase/ui";
import { useSession } from "next-auth/react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import React from "react";

import type { NextPageWithLayout } from "types";
import { AuthLayout } from "@components/layouts";
import env from "@lib/env";
import tenants from "models/tenants";
import { getSession } from "@lib/session";

const Organizations: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ organizations }) => {
  const router = useRouter();
  const { status } = useSession();

  if (status === "unauthenticated") {
    router.push("/auth/login");
  }

  React.useEffect(() => {
    if (organizations === null) {
      toast.error("You do not have any organizations.");
      return;
    }

    router.push(`/organizations/${organizations[0].slug}/dashboard`);
  });

  return (
    <>
      <div className="mb-6 flex w-1/2 flex-col items-center gap-4 p-3">
        <Typography.Title level={3}>Choose your organizations</Typography.Title>
        <div className="w-3/5 rounded bg-white dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0"></div>
      </div>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);

  return {
    props: {
      redirectAfterSignIn: env.redirectAfterSignIn,
      organizations: await tenants.getTenants(session?.user.id as string),
    },
  };
};

Organizations.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default Organizations;
