import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal, Button, Input } from "react-daisyui";
import { useTranslation } from "next-i18next";
import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import useTeams from "hooks/useTeams";
import { getAxiosError } from "@/lib/common";

const CreateTeam = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  const { t } = useTranslation("common");
  const { mutateTeams } = useTeams();

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post<ApiResponse<Team>>("/api/teams/", {
          ...values,
        });

        const { data: teamCreated } = response.data;

        if (teamCreated) {
          toast.success(t("team-created"));
          mutateTeams();
          formik.resetForm();
          setVisible(false);
        }
      } catch (error: any) {
        toast.error(getAxiosError(error));
      }
    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">Create Team</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>{t("members-of-a-team")}</p>
            <div className="flex justify-between space-x-3">
              <Input
                name="name"
                className="flex-grow"
                onChange={formik.handleChange}
                value={formik.values.name}
                placeholder="Team name"
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
            {t("create-team")}
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

export default CreateTeam;
