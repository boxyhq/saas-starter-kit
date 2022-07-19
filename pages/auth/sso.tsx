import type { ReactElement } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import axios from "axios";
import { Button } from "react-daisyui";

import type { NextPageWithLayout, ApiResponse } from "types";
import { AuthLayout } from "@components/layouts";
import { InputWithLabel } from "@components/ui";

const SSO: NextPageWithLayout = () => {
  const { status } = useSession();
  const router = useRouter();

  // SSO callback has query paramters called code and state.
  const { code, state } = router.query;

  if (status === "authenticated") {
    router.push("/");
  }

  // Handle the SAML SSO callback (ACS)
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

  const formik = useFormik({
    initialValues: {
      slug: "",
    },
    validationSchema: Yup.object().shape({
      slug: Yup.string().required("Organization ID is required"),
    }),
    onSubmit: async (values) => {
      const { slug } = values;

      const response = await axios.post<ApiResponse<{ redirect_url: string }>>(
        `/api/auth/sso`,
        {
          slug,
        },
        {
          validateStatus: () => true,
        }
      );

      const { data, error } = response.data;

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
      <div className="rounded-md bg-white p-6 shadow-sm">
        <form className="space-y-4 md:space-y-6" onSubmit={formik.handleSubmit}>
          <InputWithLabel
            type="text"
            label="Organization ID"
            name="slug"
            placeholder="acme"
            value={formik.values.slug}
            descriptionText="Contact your administrator to get your organization ID"
            error={formik.touched.slug ? formik.errors.slug : undefined}
            onChange={formik.handleChange}
          />
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
            fullWidth
          >
            Continue with SAML SSO
          </Button>
        </form>
      </div>
    </>
  );
};

SSO.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout
      heading="Sign in with SAML SSO"
      description="Your ID is the slug after the hostname."
    >
      {page}
    </AuthLayout>
  );
};

export default SSO;
