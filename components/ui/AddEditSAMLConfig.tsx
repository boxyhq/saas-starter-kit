import { useFormik } from "formik";
import * as Yup from "yup";
import Router from "next/router";
import { Button, Input, Typography } from "@supabase/ui";
import axios from "axios";

import type { SAMLConfig, ApiResponse } from "types";
import { Card } from "@components/ui";
import { Tenant } from "@prisma/client";

const AddEditSAMLConfig = ({ tenant }: { tenant: Tenant }) => {
  const formik = useFormik({
    initialValues: {
      metadata: "",
    },
    validationSchema: Yup.object().shape({
      metadata: Yup.string().required("Metadata is required"),
    }),
    onSubmit: async (values) => {
      const response = await axios.post<ApiResponse<SAMLConfig>>(
        `/api/organizations/${tenant.slug}/saml`,
        {
          encodedRawMetadata: Buffer.from(values.metadata).toString("base64"),
        }
      );

      const { data, error } = response.data;

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
