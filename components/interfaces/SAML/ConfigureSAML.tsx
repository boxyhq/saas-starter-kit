import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Button, Textarea, Modal } from "react-daisyui";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import type { SAMLSSORecord } from "@boxyhq/saml-jackson";

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
  const { t } = useTranslation("common");

  const formik = useFormik({
    initialValues: {
      metadata: "",
    },
    validationSchema: Yup.object().shape({
      metadata: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { metadata } = values;

      const response = await axios.post<ApiResponse<SAMLSSORecord>>(
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
        toast.success(t("saml-config-updated"));
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
            <p>{t("setup-saml-auth")}</p>
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
            {t("save-changes")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {t("close")}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default ConfigureSAML;
