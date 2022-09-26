import type { ReactElement } from "react";
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
import { Button } from "react-daisyui";

import type { NextPageWithLayout } from "types";
import { AuthLayout } from "@/components/layouts";
import { InputWithLabel } from "@/components/ui";
import { getParsedCookie } from "@/lib/cookie";
import env from "@/lib/env";

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
      password: "",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email(),
      password: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { email, password } = values;

      const response = await signIn("credentials", {
        email,
        password,
        csrfToken,
        redirect: false,
        callbackUrl: redirectAfterSignIn,
      });

      formik.resetForm();

      if (!response?.ok) {
        toast.error("There was a problem with your login.");
        return;
      }
    },
  });

  return (
    <>
      <div className="rounded-md bg-white p-6 shadow-sm">
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-2">
            <InputWithLabel
              type="email"
              label="Email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              error={formik.touched.email ? formik.errors.email : undefined}
              onChange={formik.handleChange}
            />
            <InputWithLabel
              type="password"
              label="Password"
              name="password"
              placeholder="Password"
              value={formik.values.password}
              error={
                formik.touched.password ? formik.errors.password : undefined
              }
              onChange={formik.handleChange}
            />
          </div>
          <div className="mt-4">
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              active={formik.dirty}
              fullWidth
            >
              Sign in
            </Button>
          </div>
        </form>
        <div className="divider"></div>
        <div className="space-y-3">
          <Link href="/auth/magic-link">
            <a className="btn btn-outline w-full">&nbsp;Sign in with Email</a>
          </Link>
          <Link href="/auth/sso">
            <a className="btn btn-outline w-full">
              &nbsp;Continue with SAML SSO
            </a>
          </Link>
        </div>
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
    <AuthLayout heading="Welcome back" description="Log in to your account">
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
