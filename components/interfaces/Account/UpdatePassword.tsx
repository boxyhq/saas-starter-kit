import { useFormik } from "formik";
import axios, { AxiosError } from "axios";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Button } from "react-daisyui";
import { useTranslation } from "next-i18next";

import type { ApiResponse } from "types";
import { Card, InputWithLabel } from "@/components/ui";

const schema = Yup.object().shape({
  currentPassword: Yup.string().required(),
  newPassword: Yup.string().required("Required"),
  confirmationPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords don't match!")
    .required("Required"),
});

const UpdatePassword = () => {
  const { t } = useTranslation("common");

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmationPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const { data } = await axios.patch(`/api/users`, values);

        if (data) {
          toast.success(t("successfully-updated"));
        }
      } catch (error: unknown | AxiosError) {
        if (axios.isAxiosError(error)) {
          const err = error as AxiosError<ApiResponse>;
          toast.error(String(err?.response?.data.error?.message));
        }
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card heading="Update Password">
          <Card.Body className="p-5">
            <div className="flex flex-col space-y-6">
              <InputWithLabel
                type="password"
                label="Current password"
                name="currentPassword"
                placeholder="Type your current"
                value={formik.values.currentPassword}
                error={
                  formik.touched.currentPassword
                    ? formik.errors.currentPassword
                    : undefined
                }
                onChange={formik.handleChange}
              />
              <InputWithLabel
                type="password"
                label="New password"
                name="newPassword"
                placeholder="Type your new password"
                value={formik.values.newPassword}
                error={
                  formik.touched.newPassword
                    ? formik.errors.newPassword
                    : undefined
                }
                onChange={formik.handleChange}
              />
              <InputWithLabel
                type="password"
                label="Confirm password"
                name="confirmationPassword"
                placeholder="Confirm your password"
                value={formik.values.confirmationPassword}
                error={
                  formik.touched.confirmationPassword
                    ? formik.errors.confirmationPassword
                    : undefined
                }
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
                active={formik.dirty}
                disabled={!formik.isValid}
              >
                {t("change-password")}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </form>
    </>
  );
};

export default UpdatePassword;
