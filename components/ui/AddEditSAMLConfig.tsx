import { useFormik } from "formik";
import * as Yup from "yup";
import Router from "next/router";
import { Button, Input, Typography } from "@supabase/ui";

import type { SAMLConfig } from "@lib/jackson";
import { post } from "@lib/fetch";
import { Card } from "@components/ui";
import { Tenant } from "@prisma/client";

const AddEditSAMLConfig = ({
  tenant,
  config,
}: {
  tenant: Tenant;
  config: any;
}) => {
  const formik = useFormik({
    initialValues: {
      metadata: "",
    },
    validationSchema: Yup.object().shape({
      metadata: Yup.string().required("Metadata is required"),
    }),
    onSubmit: async (values) => {
      const { data, error } = await post<SAMLConfig>(
        `/api/organizations/${tenant.slug}/saml`,
        {
          encodedRawMetadata: Buffer.from(values.metadata).toString("base64"),
        }
      );

      if (error) {
        formik.setErrors(error.values);
      }

      if (data) {
        Router.reload();
      }
    },
  });

  return (
    <>
      <Typography.Title level={4}>{tenant.name}</Typography.Title>
      <form onSubmit={formik.handleSubmit}>
        <Card heading="SAML Authentication">
          <Card.Body className="px-3 py-3">
            <div className="flex flex-col space-y-3">
              <Typography.Text>
                Fill out the information below to set up SAML authentication for
                added security.
              </Typography.Text>
              <Input.TextArea
                label="Metadata XML"
                rows={8}
                placeholder="Copy and paste Metadata XML here."
                name="metadata"
                onChange={formik.handleChange}
                value={formik.values.metadata}
                error={
                  formik.touched.metadata ? formik.errors.metadata : undefined
                }
              />
              <Typography.Text>
                Identity Provider will ask you for the following information to
                configure your SAML app.
              </Typography.Text>
              <Typography.Text>
                <strong>Entity ID:</strong> {config.audience}
              </Typography.Text>
              <Typography.Text>
                <strong>ACS URL:</strong> {config.acsUrl}
              </Typography.Text>
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

export default AddEditSAMLConfig;
