import { defaultHeaders } from '@/lib/common';
import { availableRoles } from '@/lib/permissions';
import type { Invitation, Team } from '@prisma/client';
import { useFormik } from 'formik';
import useInvitations from 'hooks/useInvitations';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button, Input } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';
import Modal from '../shared/Modal';

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
      email: Yup.string().email().required(t('require-email')),
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
    <Modal open={visible} close={toggleVisible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header>{t('invite-new-member')}</Modal.Header>
        <Modal.Description>{t('invite-member-message')}</Modal.Description>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <Input
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              placeholder="jackson@boxyhq.com"
              required
            />
            <select
              className="select-bordered select rounded"
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
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
              formik.resetForm();
            }}
            size="md"
          >
            {t('close')}
          </Button>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
            size="md"
          >
            {t('send-invite')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default InviteMember;
