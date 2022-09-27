import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Button } from "react-daisyui";

import { inferSSRProps } from "@/lib/inferSSRProps";
import { getSession } from "@/lib/session";
import { Card, InputWithLabel } from "@/components/ui";
import { getUserBySession } from "models/user";

const Account: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  user,
}) => {
  const formik = useFormik({
    initialValues: {
      name: user?.name,
      email: user?.email,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { name, email } = values;

      const response = await axios.put("/api/users", {
        name,
        email,
      });

      const { data, error } = response.data;

      if (error) {
        toast.error(error.message);
      }

      if (data) {
        toast.success("Successfully updated");
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card heading="Account">
          <Card.Body className="px-3 py-3">
            <div className="flex flex-col space-y-6">
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
                placeholder="Your email"
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
                active={formik.dirty}
              >
                Save Changes
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </form>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);

  return {
    props: {
      user,
    },
  };
};

export default Account;
