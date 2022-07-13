import { Modal, Input } from "@supabase/ui";
import React from "react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";

import { post } from "@lib/fetch";

export default function CreateTeam(props: Props) {
  const { visible, setVisible } = props;
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required("Name is required"),
      slug: Yup.string().required("Slug is required"),
    }),
    onSubmit: async (values) => {
      const { data: team, error } = await post("/api/teams", values);

      if (error && error.values) {
        formik.setErrors(error.values);
      }

      if (team) {
        setVisible(false);
        router.replace(`/teams/${team.id}/settings`);
      }
    },
  });

  return (
    <Modal
      title="Create a Team"
      description="To collaborate with your team, create a team."
      visible={visible}
      onCancel={() => {
        setVisible(!visible);
      }}
      onConfirm={formik.submitForm}
      confirmText="Create Team"
      alignFooter="right"
      footerBackground
      loading={formik.isSubmitting}
    >
      <div className="w-full">
        <div className="flex justify-between space-x-3">
          <Input
            name="name"
            label="Team Name"
            placeholder="BoxyHQ"
            className="flex-grow"
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : undefined}
          />
          <Input
            name="slug"
            label="Team Slug"
            placeholder="boxyhq"
            className="flex-grow"
            onChange={formik.handleChange}
            value={formik.values.slug}
            error={formik.touched.slug ? formik.errors.slug : undefined}
          />
        </div>
      </div>
    </Modal>
  );
}

type Props = { visible: boolean; setVisible: (visible: boolean) => void };
