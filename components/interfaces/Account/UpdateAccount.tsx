import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Button } from "react-daisyui";
import { useTranslation } from "next-i18next";
import { getAxiosError } from "@/lib/common";
import type { ApiResponse } from "types";
import { Card, InputWithLabel } from "@/components/ui";
import { User } from "@prisma/client";

const schema = Yup.object().shape({
  name: Yup.string().required(),
  email: Yup.string().required(),
});

const UpdateAccount = ({ user }: { user: User }) => {
  const { t } = useTranslation("common");

  const formik = useFormik({
    initialValues: {
      name: user.name,
      email: user.email,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await axios.put<ApiResponse<User>>("/api/users", {
          ...values,
        });

        toast.success(t("successfully-updated"));
      } catch (error) {
        toast.error(getAxiosError(error));
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card heading="Your Profile">
        <Card.Body className="p-4">
          <div className="flex flex-col space-y-2">
            <InputWithLabel
              type="text"
              label="Name"
              name="name"
              placeholder={t("your-name")}
              value={formik.values.name}
              error={formik.touched.name ? formik.errors.name : undefined}
              onChange={formik.handleChange}
            />
            <InputWithLabel
              type="email"
              label="Email"
              name="email"
              placeholder={t("your-email")}
              value={formik.values.email}
              error={formik.touched.email ? formik.errors.email : undefined}
              onChange={formik.handleChange}
            />
          </div>
        </Card.Body>
        <Card.Footer>
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              disabled={!formik.dirty || !formik.isValid}
              size="sm"
            >
              {t("save-changes")}
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default UpdateAccount;
