import type { ReactElement } from "react";
import { Typography } from "@supabase/ui";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

import type { NextPageWithLayout } from "types";
import { AuthLayout } from "@components/layouts";

const SSOCallback: NextPageWithLayout = () => {
  const { status } = useSession();
  const router = useRouter();

  const { code, state } = router.query;

  if (status === "authenticated") {
    router.push("/");
  }

  React.useEffect(() => {
    if (!router.isReady) {
      return;
    }

    signIn("saml-sso", {
      code,
      state,
      redirect: false,
    });
  }, [router.isReady, code, state]);

  return (
    <>
      <Typography variant="h1">Redirect... </Typography>
    </>
  );
};

SSOCallback.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SSOCallback;
