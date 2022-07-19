import type { ReactElement } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";

import type { User } from "@prisma/client";
import type { ApiResponse, NextPageWithLayout } from "types";
import { AuthLayout } from "@components/layouts";
import { inferSSRProps } from "@lib/inferSSRProps";
import { getParsedCookie } from "@lib/cookie";
import JoinWithInvitation from "components/Join/JoinWithInvitation";
import Join from "components/Join/Join";

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

    const response = await axios.post<ApiResponse<User>>(`/api/auth/join`, {
      name,
      email,
      tenant,
      inviteToken,
    });

    const { data: user, error } = response.data;

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
      <div className="rounded-md bg-white p-6 shadow-sm">
        {inviteToken ? (
          <JoinWithInvitation
            inviteToken={inviteToken}
            createAccount={createAccount}
          />
        ) : (
          <Join createAccount={createAccount} />
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
