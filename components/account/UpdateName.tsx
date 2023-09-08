import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button, Input } from 'react-daisyui';

import type { ApiResponse } from 'types';
import { Card } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { User } from '@prisma/client';

const schema = Yup.object().shape({
  name: Yup.string().required(),
});

const UpdateName = ({ user }: { user: User }) => {
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      name: user.name,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<User>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('successfully-updated'));
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>Name</Card.Title>
            <Card.Description>
              This is how your name will appear in the interface.
            </Card.Description>
          </Card.Header>
          <Input
            type="text"
            name="name"
            placeholder={t('your-name')}
            value={formik.values.name}
            onChange={formik.handleChange}
            className="w-full max-w-md"
            required
          />
        </Card.Body>
        <Card.Footer>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            disabled={!formik.dirty || !formik.isValid}
            size="md"
          >
            {t('save-changes')}
          </Button>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default UpdateName;
