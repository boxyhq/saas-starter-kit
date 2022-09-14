import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal, Button, Input } from "react-daisyui";

import type { Invitation, Team } from "@prisma/client";
import type { ApiResponse } from "types";
import { availableRoles } from "@/lib/roles";
import useInvitations from "hooks/useInvitations";

const InviteMember = ({
  visible,
  setVisible,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const { mutateInvitation } = useInvitations(team.slug);

  const formik = useFormik({
    initialValues: {
      email: "",
      role: "member",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().email().required(),
      role: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { email, role } = values;

      const response = await axios.post<ApiResponse<Invitation>>(
        `/api/teams/${team.slug}/invitations`,
        {
          email,
          role,
        }
      );

      const { data: invitation, error } = response.data;

      if (error) {
        toast.error(error.message);
      }

      if (invitation) {
        toast.success("Invitation sent!");
      }

      mutateInvitation();
      setVisible(false);
      formik.resetForm();
    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">Invite New Member</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>Invite new member by email to join your organization.</p>
            <div className="flex justify-between space-x-3">
              <Input
                name="email"
                className="flex-grow"
                onChange={formik.handleChange}
                value={formik.values.email}
                placeholder="jackson@boxyhq.com"
                required
              />
              <select
                className="select select-bordered flex-grow"
                name="role"
                onChange={formik.handleChange}
                required
              >
                {availableRoles.map((role: any) => (
                  <option value={role.id} key={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
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
            Send Invite
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

export default InviteMember;
