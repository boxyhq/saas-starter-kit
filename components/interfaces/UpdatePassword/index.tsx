import { ApiResponse } from "types";
import { useFormik } from "formik";
import axios, { AxiosError } from "axios";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Card, InputWithLabel } from "@/components/ui";
import { Button } from "react-daisyui";
import { useRouter } from "next/router";

const UpdatePassword = () => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmationPassword: "",
    },
    validationSchema: Yup.object().shape({
      currentPassword: Yup.string().required(),
      newPassword: Yup.string().required("Required"),
      confirmationPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords don't match!")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      const { confirmationPassword, currentPassword, newPassword } = values;

      try {
        const response = await axios.patch(`/api/users`, {
          confirmationPassword,
          currentPassword,
          newPassword,
        });

        const { data } = response.data;

        if (data) {
          toast.success("Successfully updated");
          router.reload();
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
          <Card.Body className="px-3 py-3">
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
                Change password
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </form>
    </>
  );
};

export default UpdatePassword;
