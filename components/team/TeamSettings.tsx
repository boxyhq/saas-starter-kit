import { Card, InputWithLabel } from '@/components/shared';
import { defaultHeaders, domainRegex } from '@/lib/common';
import { Team } from '@prisma/client';
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
      domain: Yup.string().nullable().matches(domainRegex, {
        message: 'Invalid domain: ${value}',
      }),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const response = await fetch(`/api/teams/${team.slug}`, {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<Team>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('successfully-updated'));
      router.push(`/teams/${json.data.slug}/settings`);
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card>
          <Card.Body>
            <Card.Header>
              <Card.Title>{t('team-settings')}</Card.Title>
              <Card.Description>{t('team-settings-config')}</Card.Description>
            </Card.Header>
            <div className="flex flex-col gap-4">
              <InputWithLabel
                name="name"
                label={t('team-name')}
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.errors.name}
              />
              <InputWithLabel
                name="slug"
                label={t('team-slug')}
                value={formik.values.slug}
                onChange={formik.handleChange}
                error={formik.errors.slug}
              />
              <InputWithLabel
                name="domain"
                label={t('team-domain')}
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
