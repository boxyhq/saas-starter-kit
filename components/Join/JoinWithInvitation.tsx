import { useFormik } from "formik";
import * as Yup from "yup";
import { Input, Button, Typography } from "@supabase/ui";

const JoinWithInvitation = ({
  inviteToken,
  createAccount,
}: {
  inviteToken: string;
  createAccount: any;
}) => {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
    }),
    onSubmit: async (values) => {
      const { name, email } = values;

      await createAccount({
        name,
        email,
        inviteToken,
      });

      formik.resetForm();
    },
  });

  return (
    <form className="space-y-4 md:space-y-6" onSubmit={formik.handleSubmit}>
      <Input
        label="Name"
        type="text"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        error={formik.touched.name ? formik.errors.name : undefined}
        placeholder="Your name"
      />
      <Input
        label="Email"
        type="email"
        name="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email ? formik.errors.email : undefined}
        placeholder="you@company.com"
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
          Signing up signifies that you have read and agree to the Terms of
          Service and our Privacy Policy. Cookie Preferences.
        </Typography.Text>
      </div>
    </form>
  );
};

export default JoinWithInvitation;
