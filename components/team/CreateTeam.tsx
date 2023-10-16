import { defaultHeaders } from '@/lib/common';
import type { Team } from '@prisma/client';
import { useFormik } from 'formik';
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button, Input, Modal } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';

const CreateTeam = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  const { t } = useTranslation('common');
  const { mutateTeams } = useTeams();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
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

  return (
    <Modal open={visible}>
      <Button
        type="button"
        size="sm"
        shape="circle"
        className="absolute right-2 top-2 rounded-full btn-outline"
        onClick={() => {
          setVisible(!visible);
        }}
        aria-label={t('close')}
      >
        ✕
      </Button>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">{t('create-team')}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>{t('members-of-a-team')}</p>
            <div className="flex justify-between space-x-3">
              <Input
                name="name"
                className="flex-grow"
                onChange={formik.handleChange}
                value={formik.values.name}
                placeholder={t('team-name')}
                color={formik.errors.name ? 'error' : 'primary'}
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
            size="md"
            disabled={!formik.isValid}
          >
            {t('create-team')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
            size="md"
          >
            {t('close')}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default CreateTeam;
