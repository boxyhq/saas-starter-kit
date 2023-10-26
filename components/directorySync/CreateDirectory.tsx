import { InputWithLabel, Loading } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import fetcher from '@/lib/fetcher';
import type { Directory } from '@boxyhq/saml-jackson';
import { Team } from '@prisma/client';
import { useFormik } from 'formik';
import useDirectory from 'hooks/useDirectory';
import { useTranslation } from 'next-i18next';
import { Button, Modal } from 'react-daisyui';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';

const CreateDirectory = ({
  visible,
  setVisible,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const { t } = useTranslation('common');
  const { data } = useSWR('/api/idp', fetcher);
  const { mutateDirectory } = useDirectory(team.slug as string);

  const formik = useFormik({
    initialValues: {
      name: '',
      provider: 'generic-scim-v2',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      provider: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const response = await fetch(`/api/teams/${team.slug}/directory-sync`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<Directory>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('directory-connection-created'));
      mutateDirectory();
      setVisible(false);
    },
  });

  const toggleVisible = () => {
    setVisible(!visible);
  };

  if (!data) {
    return <Loading />;
  }

  const providers = data.data;

  return (
    <Modal open={visible}>
      <Button
        type="button"
        size="sm"
        shape="circle"
        className="absolute right-2 top-2 btn-outline rounded-full"
        onClick={toggleVisible}
        aria-label={t('close')}
      >
        ✕
      </Button>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">
          {t('create-directory-connection')}
        </Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-2">
            <p>{t('create-directory-message')}</p>
            <InputWithLabel
              name="name"
              onChange={formik.handleChange}
              value={formik.values.name}
              placeholder={t('directory-name-placeholder')}
              label={t('directory-name')}
            />
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">
                  {t('directory-sync-provider')}
                </span>
                <span className="label-text-alt"></span>
              </label>
              <select
                className="select-bordered select flex-grow"
                name="provider"
                onChange={formik.handleChange}
                value={formik.values.provider}
                required
              >
                {Object.keys(providers).map((key) => (
                  <option value={key} key={key}>
                    {providers[key]}
                  </option>
                ))}
              </select>
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
          >
            {t('create-directory')}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default CreateDirectory;
