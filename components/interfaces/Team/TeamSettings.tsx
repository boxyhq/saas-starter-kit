import React from "react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "react-daisyui";
import { useRouter } from "next/router";
import axios from "axios";

import { Team } from "@prisma/client";
import type { ApiResponse } from "types";
import { Card, InputWithLabel } from "@/components/ui";

const TeamSettings = ({ team }: { team: Team }) => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: team?.name,
      slug: team?.slug,
      domain: team?.domain,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required("Name is required"),
      slug: Yup.string().required("Slug is required"),
      domain: Yup.string().nullable(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const { name, slug, domain } = values;

      const response = await axios.put<ApiResponse<Team>>(
        `/api/teams/${team.slug}`,
        {
          name,
          slug,
          domain,
        }
      );

      const { data: updatedTeam, error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      if (updatedTeam) {
        toast.success("Successfully updated!");
        return router.push(`/teams/${updatedTeam.slug}/settings`);
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card heading="Team Settings">
          <Card.Body className="px-3 py-3">
            <div className="flex flex-col">
              <InputWithLabel
                name="name"
                label="Display name"
                descriptionText="A human-friendly name for the team"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.errors.name}
              />
              <InputWithLabel
                name="slug"
                label="Team slug"
                descriptionText="A unique ID used to identify this team"
                value={formik.values.slug}
                onChange={formik.handleChange}
                error={formik.errors.slug}
              />
              <InputWithLabel
                name="domain"
                label="Domain"
                descriptionText="Domain name for the team"
                value={formik.values.domain ? formik.values.domain : ""}
                onChange={formik.handleChange}
                error={formik.errors.domain}
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

export default TeamSettings;
