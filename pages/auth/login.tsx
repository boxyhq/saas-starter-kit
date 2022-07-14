import type { ReactElement } from "react";
import { Input, Button, Typography } from "@supabase/ui";
import { useSession, getCsrfToken, signIn } from "next-auth/react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";

import type { NextPageWithLayout } from "types";
import { AuthLayout } from "@components/layouts";
import env from "@lib/env";
import { getParsedCookie } from "@lib/cookie";

const Login: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, redirectAfterSignIn }) => {
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.push(redirectAfterSignIn);
  }

  const formik = useFormik({
    initialValues: {
      email: "kiran@boxyhq.com",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required("Email is required").email("Invalid email"),
    }),
    onSubmit: async (values) => {
      const response = await signIn("email", {
        email: values.email,
        csrfToken,
        redirect: false,
        callbackUrl: redirectAfterSignIn,
      });

      if (response?.error) {
        toast.error(
          "Something went wrong while sending the email. Please try again later."
        );
        return;
      }

      if (response?.status === 200 && response?.ok) {
        toast.success(
          "A sign in link has been sent to your email address. The link will expire in 24 hours."
        );
        return;
      }
    },
  });

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
      <div className="mb-6 flex w-1/2 flex-col items-center gap-4 p-3">
        <Typography.Title level={3}>Sign in to your account</Typography.Title>
        <div className="w-3/5 rounded bg-white dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div className="p-6">
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={formik.handleSubmit}
            >
              <Input
                label="Email"
                type="email"
                name="email"
                descriptionText="We’ll email you a magic link for a password-free sign in."
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email ? formik.errors.email : undefined}
              />
              <Button size="medium" block loading={formik.isSubmitting}>
                Sign Magic Link
              </Button>
            </form>
            <div className="mt-3 flex items-center justify-center">
              <Typography.Text>
                or continue with
                <Link href="/auth/sso">
                  <a className="ml-1 text-blue-600">SAML SSO</a>
                </Link>
              </Typography.Text>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Typography.Text>
            Don`t have an account?
            <Link href="/auth/join">
              <a className="ml-1 text-blue-600">Sign up</a>
            </Link>
          </Typography.Text>
        </div>
      </div>
    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req, res } = context;

  const cookieParsed = getParsedCookie(req, res);

  return {
    props: {
      csrfToken: await getCsrfToken(context),
      redirectAfterSignIn: cookieParsed.url ?? env.redirectAfterSignIn,
    },
  };
};

export default Login;
