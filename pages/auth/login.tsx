import type { ReactElement } from "react";
import { Input, Button } from "@supabase/ui";
import { useSession, getCsrfToken, signIn } from "next-auth/react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
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
      email: "",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email(),
    }),
    onSubmit: async (values) => {
      const response = await signIn("email", {
        email: values.email,
        csrfToken,
        redirect: false,
        callbackUrl: redirectAfterSignIn,
      });

      formik.resetForm();

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
      <div className="rounded-md bg-white p-6 shadow-sm">
        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="jackson@boxyhq.com"
            descriptionText="We’ll email you a magic link for a password-free sign in."
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email ? formik.errors.email : undefined}
          />
          <Button
            size="medium"
            block
            loading={formik.isSubmitting}
            htmlType="submit"
          >
            Sign Magic Link
          </Button>
        </form>
        <p className="mt-3 text-center text-sm text-gray-600">
          You can also
          <Link href="/auth/sso">
            <a className="font-medium text-indigo-600 hover:text-indigo-500">
              &nbsp;continue with SAML SSO
            </a>
          </Link>
        </p>
      </div>
      <p className="text-center text-sm text-gray-600">
        Don`t have an account?
        <Link href="/auth/join">
          <a className="font-medium text-indigo-600 hover:text-indigo-500">
            &nbsp;create a free account
          </a>
        </Link>
      </p>
    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout
      heading="Sign in to your account"
      description="Start your 14-day free trial"
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
      csrfToken: await getCsrfToken(context),
      redirectAfterSignIn: cookieParsed.url ?? env.redirectAfterSignIn,
    },
  };
};

export default Login;
