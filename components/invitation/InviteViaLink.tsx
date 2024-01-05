import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { Button, Input } from 'react-daisyui';
import { useTranslation } from 'next-i18next';

import type { ApiResponse } from 'types';
import { defaultHeaders } from '@/lib/common';
import useInvitations from 'hooks/useInvitations';
import { availableRoles } from '@/lib/permissions';
import type { Invitation, Team } from '@prisma/client';

interface InviteViaLinkProps {
  team: Team;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const InviteViaLink = ({ visible, setVisible, team }: InviteViaLinkProps) => {
  const { t } = useTranslation('common');
  const { mutateInvitation } = useInvitations(team.slug);

  const formik = useFormik({
    initialValues: {
      domains: '',
      role: availableRoles[0].id,
    },
    validationSchema: Yup.object().shape({
      domains: Yup.string().email().required(t('require-email')),
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

  return (
    <form onSubmit={formik.handleSubmit} method="POST" className="pt-4">
      <h3 className="font-medium text-[14px] pb-2">Invite via link</h3>
      <div className="flex gap-1">
        <Input
          name="domains"
          onChange={formik.handleChange}
          value={formik.values.domains}
          placeholder="boxyhq.com"
          className="text-sm w-1/2"
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
        <Button
          type="submit"
          color="primary"
          loading={formik.isSubmitting}
          disabled={!formik.isValid || !formik.dirty}
          className="flex-grow"
        >
          {t('send-invite')}
        </Button>
      </div>
      <p className="text-sm text-slate-500 my-4">
        Anyone can use this link to join your team.
      </p>
    </form>
  );
};

export default InviteViaLink;
