import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import { Input, Button } from "@supabase/ui";
import React from "react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

import { inferSSRProps } from "@lib/inferSSRProps";
import { getSession } from "@lib/session";
import { Card } from "@components/ui";
import users from "models/users";

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
              <Input
                name="name"
                label="Your name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.errors.name}
              />
              <Input
                name="slug"
                label="Your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.errors.email}
              />
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="flex justify-end">
              <Button htmlType="submit" loading={formik.isSubmitting}>
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
  const user = await users.getUserBySession(session);

  return {
    props: {
      user,
    },
  };
};

export default Account;
