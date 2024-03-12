import { defaultHeaders, maxLengthPolicies } from '@/lib/common';
import type { Team } from '@prisma/client';
import { useFormik } from 'formik';
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';
import Modal from '../shared/Modal';
import { InputWithLabel } from '../shared';

interface CreateTeamProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const CreateTeam = ({ visible, setVisible }: CreateTeamProps) => {
  const { t } = useTranslation('common');
  const { mutateTeams } = useTeams();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required().max(maxLengthPolicies.team),
    }),
    onSubmit: async (values) => {
      const response = await fetch('/api/teams/', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<Team>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      formik.resetForm();
      mutateTeams();
      setVisible(false);
      toast.success(t('team-created'));
      router.push(`/teams/${json.data.slug}/settings`);
    },
  });

  const onClose = () => {
    setVisible(false);
    router.push(`/teams`);
  };

  return (
    <Modal open={visible} close={onClose}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header>{t('create-team')}</Modal.Header>
        <Modal.Description>{t('members-of-a-team')}</Modal.Description>
        <Modal.Body>
          <InputWithLabel
            label={t('name')}
            name="name"
            onChange={formik.handleChange}
            value={formik.values.name}
            placeholder={t('team-name')}
            required
          />
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline" onClick={onClose} size="md">
            {t('close')}
          </Button>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            size="md"
            disabled={!formik.dirty || !formik.isValid}
          >
            {t('create-team')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateTeam;
