import { defaultHeaders } from '@/lib/common';
import { availableRoles } from '@/lib/permissions';
import type { Invitation, Team } from '@prisma/client';
import { useFormik } from 'formik';
import useInvitations from 'hooks/useInvitations';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button, Input, Modal } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';

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
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      email: '',
      role: availableRoles[0].id,
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().email().required(t('require-email')), // Added error message
      role: Yup.string()
        .required(t('required-role'))
        .oneOf(availableRoles.map((r) => r.id)),
    }),
    onSubmit: async (values) => {
      const response = await fetch(`/api/teams/${team.slug}/invitations`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<Invitation>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('invitation-sent'));
      mutateInvitation();
      setVisible(false);
      formik.resetForm();
    },
  });
  const toggleVisible = () => {
    setVisible(!visible);
  };

  return (
    <Modal open={visible}>
      <Button
        type="button"
        size="sm"
        shape="circle"
        className="absolute right-2 top-2 rounded-full btn-outline"
        onClick={toggleVisible}
        aria-label={t('close')}
      >
        ✕
      </Button>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">
          {t('invite-new-member')}
        </Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>{t('invite-member-message')}</p>
            <div className="flex justify-between space-x-3">
              <Input
                name="email"
                className="flex-grow"
                color={
                  formik.touched.email && formik.errors.email
                    ? 'error'
                    : undefined
                }
                onChange={formik.handleChange}
                value={formik.values.email}
                placeholder="jackson@boxyhq.com"
                required
              />
              <select
                className="select-bordered select flex-grow rounded"
                name="role"
                onChange={formik.handleChange}
                required
              >
                {availableRoles.map((role) => (
                  <option value={role.id} key={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            {formik.touched.email && formik.errors.email && (
              <span
                className="text-red-600"
                style={{
                  position: 'absolute',
                  left: 30,
                  bottom: 55,
                  fontSize: '0.75em',
                }}
              >
                {formik.errors.email}
              </span>
            )}
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
            size="md"
          >
            {t('send-invite')}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default InviteMember;
