import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "react-daisyui";

import { InputWithLabel } from "@components/ui";

const Join = ({ createAccount }: { createAccount: any }) => {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      tenant: "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
      tenant: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { name, email, tenant } = values;

      await createAccount({
        name,
        email,
        tenant,
      });

      formik.resetForm();
    },
  });

  return (
    <form className="space-y-4 md:space-y-6" onSubmit={formik.handleSubmit}>
      <InputWithLabel
        type="text"
        label="Name"
        name="name"
        placeholder="Your name"
        value={formik.values.name}
        error={formik.touched.name ? formik.errors.name : undefined}
        onChange={formik.handleChange}
      />
      <InputWithLabel
        type="text"
        label="Organization"
        name="tenant"
        placeholder="Organization name"
        value={formik.values.tenant}
        error={formik.touched.tenant ? formik.errors.tenant : undefined}
        onChange={formik.handleChange}
      />
      <InputWithLabel
        type="email"
        label="Email"
        name="email"
        placeholder="jackson@boxyhq.com"
        value={formik.values.email}
        error={formik.touched.email ? formik.errors.email : undefined}
        onChange={formik.handleChange}
      />
      <Button
        type="submit"
        color="primary"
        loading={formik.isSubmitting}
        fullWidth
      >
        Create Account
      </Button>
      <div>
        <p className="text-sm">
          Signing up signifies that you have read and agree to the Terms of
          Service and our Privacy Policy. Cookie Preferences.
        </p>
      </div>
    </form>
  );
};

export default Join;
