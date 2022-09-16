import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "react-daisyui";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import axios from "axios";

import type { User } from "@prisma/client";
import type { ApiResponse } from "types";
import { InputWithLabel } from "@/components/ui";

const Join = () => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      team: "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
      password: Yup.string().required().min(7),
      team: Yup.string().required().min(3),
    }),
    onSubmit: async (values) => {
      const { name, email, password, team } = values;

      const response = await axios.post<ApiResponse<User>>("/api/auth/join", {
        name,
        email,
        password,
        team,
      });

      const { data: user, error } = response.data;

      formik.resetForm();

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
    <form className="" onSubmit={formik.handleSubmit}>
      <div className="space-y-1">
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
          label="Team"
          name="team"
          placeholder="Team name"
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
        <InputWithLabel
          type="password"
          label="Password"
          name="password"
          placeholder="Password"
          value={formik.values.password}
          error={formik.touched.password ? formik.errors.password : undefined}
          onChange={formik.handleChange}
        />
      </div>
      <div className="mt-3 space-y-3">
        <Button
          type="submit"
          color="primary"
          loading={formik.isSubmitting}
          active={formik.dirty}
          fullWidth
        >
          Create Account
        </Button>
        <p className="text-sm">
          Signing up signifies that you have read and agree to the Terms of
          Service and our Privacy Policy.
        </p>
      </div>
    </form>
  );
};

export default Join;
