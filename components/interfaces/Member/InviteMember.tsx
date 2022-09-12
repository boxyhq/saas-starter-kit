import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal, Button, Select, Input } from "react-daisyui";

import type { Invitation, Tenant } from "@prisma/client";
import type { ApiResponse } from "types";
import useInvitations from "hooks/useInvitations";

const InviteMember = ({
  visible,
  setVisible,
  availableRoles,
  organization,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  availableRoles: any;
  organization: Tenant;
}) => {
  const { mutateInvitation } = useInvitations(organization.slug);

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
        `/api/organizations/${organization.slug}/invitations`,
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
    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.submitForm} method="POST">
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
                placeholder="jackson@example.com"
                // error={formik.touched.email ? formik.errors.email : undefined}
              />
              <Select
                name="role"
                className="flex-grow"
                onChange={formik.handleChange}
                value={formik.values.role}
                // error={formik.touched.role ? formik.errors.role : undefined}
              >
                {availableRoles.map((role: any) => (
                  <Select.Option value={role.id} key={role.id}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
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
