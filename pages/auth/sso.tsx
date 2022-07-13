import type { ReactElement } from "react";
import { Input, Button, Typography } from "@supabase/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";

import type { NextPageWithLayout } from "types";
import { AuthLayout } from "@components/layouts";
import { post } from "@lib/fetch";
import Link from "next/link";

const SSO: NextPageWithLayout = () => {
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.push("/");
  }

  const formik = useFormik({
    initialValues: {
      slug: "boxyhq",
    },
    validationSchema: Yup.object().shape({
      slug: Yup.string().required("Organization ID is required"),
    }),
    onSubmit: async (values) => {
      const { slug } = values;

      const { data, error } = await post<{ redirect_url: string }>(
        "/api/auth/sso",
        {
          slug,
        }
      );

      if (error) {
        formik.setErrors(error.values);
      }

      if (data) {
        window.location.href = data.redirect_url;
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
        <Typography.Title level={3}>Sign in with SAML SSO</Typography.Title>
        <div className="w-3/5 rounded bg-white dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div className="p-6">
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={formik.handleSubmit}
            >
              <Input
                label="Organization ID"
                type="text"
                name="slug"
                placeholder="acme"
                descriptionText="Contact your administrator to get your organization ID"
                value={formik.values.slug}
                onChange={formik.handleChange}
                error={formik.touched.slug ? formik.errors.slug : undefined}
              />
              <Button
                size="medium"
                block
                loading={formik.isSubmitting}
                htmlType="submit"
              >
                Continue with SAML SSO
              </Button>
            </form>
          </div>
        </div>
        <div className="flex gap-2">
          <Typography.Text>Already have an account?</Typography.Text>
          <Link href="/auth/login">
            <a className="text-sm">Log in</a>
          </Link>
        </div>
      </div>
    </>
  );
};

SSO.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SSO;
