import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal, Button, Input } from "react-daisyui";

import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import useTeams from "hooks/useTeams";

const CreateTeam = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  const { mutateTeams } = useTeams();

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { name } = values;

      const response = await axios.post<ApiResponse<Team>>(`/api/teams`, {
        name,
      });

      const { data: invitation, error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      if (invitation) {
        toast.success("Team created successfully.");
      }

      mutateTeams();
      formik.resetForm();
      setVisible(false);
    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">Create Team</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>
              Members of a team have access to specific areas, such as a new
              release or a new application feature.
            </p>
            <div className="flex justify-between space-x-3">
              <Input
                name="name"
                className="flex-grow"
                onChange={formik.handleChange}
                value={formik.values.name}
                placeholder="Eg: operations, backend-team, frontend"
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
            Create Team
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

export default CreateTeam;
