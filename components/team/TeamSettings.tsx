import { Card, InputWithLabel } from '@/components/shared';
import { getAxiosError } from '@/lib/common';
import { Team } from '@prisma/client';
import axios from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';

import { AccessControl } from '../shared/AccessControl';

const TeamSettings = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      name: team.name,
      slug: team.slug,
      domain: team.domain,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Name is required'),
      slug: Yup.string().required('Slug is required'),
      domain: Yup.string().nullable(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const response = await axios.put<ApiResponse<Team>>(
          `/api/teams/${team.slug}`,
          {
            ...values,
          }
        );

        const { data: teamUpdated } = response.data;

        if (teamUpdated) {
          toast.success(t('successfully-updated'));
          return router.push(`/teams/${teamUpdated.slug}/settings`);
        }
      } catch (error: any) {
        toast.error(getAxiosError(error));
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card heading={t('team-settings')}>
          <Card.Body className="px-3 py-3">
            <div className="flex flex-col">
              <InputWithLabel
                name="name"
                label={t('team-name')}
                descriptionText={t('team-name')}
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.errors.name}
              />
              <InputWithLabel
                name="slug"
                label={t('team-slug')}
                descriptionText={t('team-slug-description')}
                value={formik.values.slug}
                onChange={formik.handleChange}
                error={formik.errors.slug}
              />
              <InputWithLabel
                name="domain"
                label={t('team-domain')}
                descriptionText={t('team-domain')}
                value={formik.values.domain ? formik.values.domain : ''}
                onChange={formik.handleChange}
                error={formik.errors.domain}
              />
            </div>
          </Card.Body>
          <AccessControl resource="team" actions={['update']}>
            <Card.Footer>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="primary"
                  loading={formik.isSubmitting}
                  disabled={!formik.isValid || !formik.dirty}
                  size="md"
                >
                  {t('save-changes')}
                </Button>
              </div>
            </Card.Footer>
          </AccessControl>
        </Card>
      </form>
    </>
  );
};

export default TeamSettings;
