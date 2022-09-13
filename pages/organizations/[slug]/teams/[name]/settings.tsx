import type { ApiResponse, NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import React from "react";
import { Button } from "react-daisyui";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import axios from "axios";

import { Card, InputWithLabel, Loading, Error } from "@/components/ui";
import { TeamTab } from "@/components/interfaces/Team";
import { inferSSRProps } from "@/lib/inferSSRProps";
import tenants from "models/tenants";
import { Team } from "@prisma/client";
import useTeam from "hooks/useTeam";

const Settings: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = ({ tenant }) => {
  const router = useRouter();
  const { name } = router.query;

  const { isLoading, isError, team } = useTeam(tenant.slug, name as string);

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { name } = values;

      const response = await axios.put<ApiResponse<Team>>(
        `/api/organizations/${tenant.slug}/teams/${team?.name}`,
        {
          name,
        }
      );

      const { data: updatedTeam } = response.data;

      if (updatedTeam) {
        return router.push(
          `/organizations/${tenant.slug}/teams/${updatedTeam.name}/settings`
        );
      }
    },
  });

  if (isLoading || !team) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <h3 className="text-2xl font-bold">
        {tenant.name} - {team.name}
      </h3>
      <TeamTab team={team} tenant={tenant} activeTab="settings" />
      <Card heading="Team Settings">
        <Card.Body className="px-3 py-3">
          <form onSubmit={formik.handleSubmit}>
            <div className="w-1/2 space-y-3">
              <InputWithLabel
                type="text"
                label="A unique ID used to identify the team"
                name="name"
                placeholder="Eg: backend"
                value={formik.values.name || team.name}
                error={formik.touched.name ? formik.errors.name : undefined}
                onChange={formik.handleChange}
              />
              <Button
                type="submit"
                color="primary"
                loading={formik.isSubmitting}
                active={formik.dirty}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
      <Card heading="Remove Team">
        <Card.Body className="px-3 py-3">
          <div className="space-y-3">
            <p className="text-sm">
              This action cannot be undone. This will permanently delete the
              team and associated access.
            </p>
            <Button color="error" size="sm">
              Remove Team
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { slug } = context.query;

  const tenant = await tenants.getTenant({ slug: slug as string });

  if (!tenant) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      tenant,
    },
  };
};

export default Settings;
