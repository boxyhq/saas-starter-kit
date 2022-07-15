import { Modal, Input, Select } from "@supabase/ui";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";

import { Invitation, Tenant } from "@prisma/client";
import useInvitations from "hooks/useInvitations";
import { ApiResponse } from "types";

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
    <Modal
      title="Invite New Member"
      description="Invite new member by email to join your organization."
      visible={visible}
      onCancel={() => {
        setVisible(!visible);
      }}
      onConfirm={formik.submitForm}
      confirmText="Send Invite"
      alignFooter="right"
      footerBackground
      loading={formik.isSubmitting}
    >
      <div className="w-full">
        <div className="flex justify-between space-x-3">
          <Input
            name="email"
            label="Email Address"
            className="flex-grow"
            onChange={formik.handleChange}
            value={formik.values.email}
            error={formik.touched.email ? formik.errors.email : undefined}
          />
          <Select
            name="role"
            label="Role"
            className="flex-grow"
            onChange={formik.handleChange}
            error={formik.touched.role ? formik.errors.role : undefined}
            value={formik.values.role}
          >
            {availableRoles.map((role: any) => (
              <Select.Option value={role.id} key={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    </Modal>
  );
};

export default InviteMember;
