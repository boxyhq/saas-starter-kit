import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "react-daisyui";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

import type { User } from "@prisma/client";
import type { ApiResponse } from "types";
import { InputWithLabel } from "@/components/ui";

const Join = () => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      team: "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
      team: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { name, email, team } = values;

      const response = await fetch("/api/auth/join", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          team,
        }),
      });

      const { data: user, error }: ApiResponse<User> = await response.json();

      if (!response.ok && error) {
        toast.error(error.message);
        return;
      }

      if (user) {
        toast.success("Successfully joined");
        formik.resetForm();
        router.push("/auth/login");
      }
    },
  });

  return (
    <form className="space-y-3" onSubmit={formik.handleSubmit}>
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
        name="team"
        placeholder="Organization name"
        value={formik.values.team}
        error={formik.touched.team ? formik.errors.team : undefined}
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
        active={formik.dirty}
        fullWidth
      >
        Create Account
      </Button>
      <div>
        <p className="text-sm">
          Signing up signifies that you have read and agree to the Terms of
          Service and our Privacy Policy.
        </p>
      </div>
    </form>
  );
};

export default Join;
