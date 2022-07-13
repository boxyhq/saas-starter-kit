import type { ReactElement } from "react";
import type { User } from "@prisma/client";
import { Input, Button, Typography } from "@supabase/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";

import type { NextPageWithLayout } from "types";
import { AuthLayout } from "@components/layouts";
import { post } from "@lib/fetch";
import Link from "next/link";

const Join: NextPageWithLayout = () => {
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.push("/");
  }

  const formik = useFormik({
    initialValues: {
      name: "Kiran K",
      email: "kiran@boxyhq.com",
      tenant: "BoxyHQ",
    },
    validationSchema: UserSchema,
    onSubmit: async (values) => {
      const { name, email, tenant } = values;

      const { data: user, error } = await post<User>("/api/auth/join", {
        name,
        email,
        tenant,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (user) {
        toast.success("Successfully joined");
        router.push("/auth/login");
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
      <div className="mb-6 flex flex-col items-center gap-4">
        <Typography.Title level={3}>Create an account</Typography.Title>
        <Typography.Text>Start your 30-day free trial</Typography.Text>
        <div className="w-full rounded bg-white dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div className="p-6">
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={formik.handleSubmit}
            >
              <Input
                label="Name"
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name ? formik.errors.name : undefined}
              />
              <Input
                label="Organization"
                type="text"
                name="tenant"
                value={formik.values.tenant}
                onChange={formik.handleChange}
                error={formik.touched.tenant ? formik.errors.tenant : undefined}
              />
              <Input
                label="Email"
                type="email"
                name="email"
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
                Create Account
              </Button>
              <div>
                <Typography.Text>
                  Signing up signifies that you have read and agree to the Terms
                  of Service and our Privacy Policy. Cookie Preferences.
                </Typography.Text>
              </div>
            </form>
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

Join.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

const UserSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  tenant: Yup.string().required("Tenant is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
});

export default Join;
