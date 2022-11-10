import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "react-daisyui";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import axios from "axios";
import { useTranslation } from "next-i18next";
import type { User } from "@prisma/client";
import type { ApiResponse } from "types";
import { InputWithLabel, Loading, Error } from "@/components/ui";
import useInvitation from "hooks/useInvitation";

const JoinWithInvitation = ({
  inviteToken,
  next,
}: {
  inviteToken: string;
  next: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation("common");

  const { isLoading, isError, invitation } = useInvitation(inviteToken);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: invitation?.email,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const { name, email } = values;

      const response = await axios.post<ApiResponse<User>>("/api/auth/join", {
        name,
        email,
        inviteToken,
      });

      const { data: user, error } = response.data;

      formik.resetForm();

      if (error) {
        toast.error(error.message);
        return;
      }

      if (user) {
        toast.success(t("successfully-joined"));

        if (next) {
          router.push(next);
        }

        router.push("/auth/login");
      }
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

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
        {t("create-account")}
      </Button>
      <div>
        <p className="text-sm">{t("sign-up-message")}</p>
      </div>
    </form>
  );
};

export default JoinWithInvitation;
