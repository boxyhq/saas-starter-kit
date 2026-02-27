import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import { Error as ErrorPanel, Loading } from '@/components/shared';
import { Button, Input, Textarea } from 'react-daisyui';

const validationSchema = Yup.object({
  name: Yup.string().min(1).max(200).required('Project name is required'),
  description: Yup.string().max(1000),
  clientName: Yup.string().max(200),
  projectNumber: Yup.string().max(100),
  discipline: Yup.string().max(100),
});

const NewMdrProjectPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isLoading, isError, team } = useTeam();

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPanel message={isError.message} />;
  if (!team) return <ErrorPanel message={t('team-not-found')} />;

  const handleSubmit = async (values: any) => {
    const res = await fetch(`/api/teams/${team.slug}/mdr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error?.message || 'Failed to create project');
      return;
    }

    toast.success('MDR project created!');
    router.push(`/teams/${team.slug}/mdr/${json.data.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('mdr-new-project')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new Master Document Register project.
        </p>
      </div>

      <Formik
        initialValues={{
          name: '',
          description: '',
          clientName: '',
          projectNumber: '',
          discipline: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">
                  Project Name <span className="text-error">*</span>
                </span>
              </label>
              <Field
                as={Input}
                name="name"
                placeholder="e.g. Offshore Platform Module C — MDR"
                className="w-full"
              />
              <ErrorMessage
                name="name"
                component="p"
                className="text-error text-sm mt-1"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <Field
                as={Textarea}
                name="description"
                placeholder="Optional description..."
                className="w-full"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Client Name</span>
                </label>
                <Field
                  as={Input}
                  name="clientName"
                  placeholder="e.g. Acme Corporation"
                  className="w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Project Number</span>
                </label>
                <Field
                  as={Input}
                  name="projectNumber"
                  placeholder="e.g. PRJ-2025-001"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Discipline</span>
              </label>
              <Field
                as={Input}
                name="discipline"
                placeholder="e.g. Mechanical, Electrical, Civil"
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                color="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Project
              </Button>
              <Button
                type="button"
                color="ghost"
                onClick={() => router.push(`/teams/${team.slug}/mdr`)}
              >
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  if (!env.teamFeatures.mdr) {
    return { notFound: true };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default NewMdrProjectPage;
