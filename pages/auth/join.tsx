import type { ReactElement } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";

import type { NextPageWithLayout } from "types";
import { AuthLayout } from "@/components/layouts";
import { inferSSRProps } from "@/lib/inferSSRProps";
import { getParsedCookie } from "@/lib/cookie";
import JoinWithInvitation from "@/components/interfaces/Auth/JoinWithInvitation";
import Join from "@/components/interfaces/Auth/Join";

const Signup: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  inviteToken,
  next,
}) => {
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.push("/");
  }

  return (
    <>
      <div className="rounded-md bg-white p-6 shadow-sm">
        {inviteToken ? (
          <JoinWithInvitation inviteToken={inviteToken} next={next} />
        ) : (
          <Join />
        )}
      </div>
      <p className="text-center text-sm text-gray-600">
        Already have an account?
        <Link href="/auth/login">
          <a className="font-medium text-indigo-600 hover:text-indigo-500">
            &nbsp;sign in
          </a>
        </Link>
      </p>
    </>
  );
};

Signup.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout
      heading="Create an account"
      description="Start your 30-day free trial"
    >
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req, res } = context;

  const cookieParsed = getParsedCookie(req, res);

  return {
    props: {
      inviteToken: cookieParsed.token,
      next: cookieParsed.url ?? "/auth/login",
    },
  };
};

export default Signup;
