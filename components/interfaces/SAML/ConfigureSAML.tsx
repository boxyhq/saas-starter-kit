import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Button, Textarea, Modal } from "react-daisyui";
import toast from "react-hot-toast";

import type { SAMLConfig } from "@boxyhq/saml-jackson";
import type { ApiResponse } from "types";
import { Team } from "@prisma/client";
import useSAMLConfig from "hooks/useSAMLConfig";

const ConfigureSAML = ({
  visible,
  setVisible,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const { mutateSamlConfig } = useSAMLConfig(team.slug);

  const formik = useFormik({
    initialValues: {
      metadata: "",
    },
    validationSchema: Yup.object().shape({
      metadata: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { metadata } = values;

      const response = await axios.post<ApiResponse<SAMLConfig>>(
        `/api/teams/${team.slug}/saml`,
        {
          encodedRawMetadata: Buffer.from(metadata).toString("base64"),
        }
      );

      const { data: samlConfig, error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      if (samlConfig) {
        toast.success("SAML Config updated successfully.");
      }

      mutateSamlConfig();
      setVisible(false);
    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">Configure SAML SSO</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>
              Fill out the information below to set up SAML authentication for
              added security.
            </p>
            <div className="flex justify-between space-x-3">
              <Textarea
                name="metadata"
                className="flex-grow"
                onChange={formik.handleChange}
                value={formik.values.metadata}
                rows={6}
                placeholder="Copy and paste Metadata XML here."
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
          >
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            Close
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default ConfigureSAML;
