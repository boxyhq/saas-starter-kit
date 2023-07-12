import { CreateSAMLConnection } from '@boxyhq/react-ui/sso';
import { Team } from '@prisma/client';
import useSAMLConfig from 'hooks/useSAMLConfig';
import { useTranslation } from 'next-i18next';
import { Modal } from 'react-daisyui';
import toast from 'react-hot-toast';

interface CreateConnectionProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}

const CreateConnection = (props: CreateConnectionProps) => {
  const { visible, setVisible, team } = props;

  const { mutateSamlConfig } = useSAMLConfig(team.slug);
  const { t } = useTranslation('common');

  // const formik = useFormik({
  //   initialValues,
  //   validationSchema,
  //   onSubmit: async (values, { resetForm }) => {
  //     const { metadataUrl, metadataRaw } = values;

  //     try {
  //       const response = await axios.post<ApiResponse<SAMLSSORecord>>(
  //         `/api/teams/${team.slug}/saml`,
  //         {
  //           metadataUrl,
  //           encodedRawMetadata: metadataRaw
  //             ? Buffer.from(metadataRaw).toString('base64')
  //             : undefined,
  //         }
  //       );

  //       const { data } = response.data;

  //       if (data) {
  //         toast.success(t('saml-config-updated'));
  //         mutateSamlConfig();
  //         setVisible(false);
  //         resetForm();
  //       }
  //     } catch (error: any) {
  //       toast.error(getAxiosError(error));
  //     }
  //   },
  // });

  return (
    <Modal open={visible}>
      <Modal.Header className="font-bold">
        {t('configure-singlesignon')}
      </Modal.Header>
      <Modal.Body>
        <CreateSAMLConnection
          successCallback={() => {
            setVisible(!visible);
            mutateSamlConfig();
          }}
          t={t}
          classNames={{ button: 'btn btn-primary' }}
          errorCallback={(errMessage) => {
            toast.error(errMessage);
          }}
          variant="basic"
          urls={{ save: `/api/teams/${team.slug}/saml` }}
        />
      </Modal.Body>
    </Modal>
  );
};

export default CreateConnection;
