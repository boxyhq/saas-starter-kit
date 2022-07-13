import type { ReactElement } from "react";
import { Typography } from "@supabase/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { GetServerSidePropsContext } from "next";
import toast from "react-hot-toast";

import type { User } from "@prisma/client";
import type { NextPageWithLayout } from "types";
import { AuthLayout } from "@components/layouts";
import Link from "next/link";
import { inferSSRProps } from "@lib/inferSSRProps";
import JoinWithInvitation from "components/Join/JoinWithInvitation";
import Join from "components/Join/Join";
import { getParsedCookie } from "@lib/cookie";
import { post } from "@lib/fetch";

type SignupParam = {
  name: string;
  email: string;
  tenant?: string;
  token?: string;
  inviteToken?: string;
};

const Signup: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  inviteToken,
  next,
}) => {
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.push("/");
  }

  const createAccount = async (params: SignupParam) => {
    const { name, email, tenant, inviteToken } = params;

    const { data: user, error } = await post<User>("/api/auth/join", {
      name,
      email,
      tenant,
      inviteToken,
    });

    if (error) {
      toast.error(error.message);
    }

    if (user) {
      toast.success("Successfully joined");

      if (next) {
        router.push(next);
      }
    }
  };

  return (
    <>
      <a
        href="#"
        className="mb-6 flex items-center text-2xl font-semibold text-gray-900 dark:text-white"
      >
        <Image
          className="mr-2 h-8 w-8"
          src="https://boxyhq.com/img/logo.png"
          alt="BoxyHQ Logo"
          width={50}
          height={50}
        />
        BoxyHQ
      </a>
      <div className="mb-6 flex flex-col items-center gap-4">
        <Typography.Title level={3}>Create an account</Typography.Title>
        <Typography.Text>Start your 30-day free trial</Typography.Text>
        <div className="w-full rounded bg-white dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div className="p-6">
            {inviteToken ? (
              <JoinWithInvitation
                inviteToken={inviteToken}
                createAccount={createAccount}
              />
            ) : (
              <Join createAccount={createAccount} />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Typography.Text>
            Already have an account?
            <Link href="/auth/login">
              <a className="ml-1 text-blue-600">Log in</a>
            </Link>
          </Typography.Text>
        </div>
      </div>
    </>
  );
};

Signup.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req, res } = context;

  const cookieParsed = getParsedCookie(req, res);

  return {
    props: {
      inviteToken: cookieParsed.token,
      next: cookieParsed.url,
    },
  };
};

export default Signup;
