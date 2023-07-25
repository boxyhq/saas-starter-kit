import { CreateSAMLConnection } from '@boxyhq/react-ui/sso';
import { Team } from '@prisma/client';
import useSAMLConfig from 'hooks/useSAMLConfig';
import { useTranslation } from 'next-i18next';
import { Button, Modal } from 'react-daisyui';
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

  const toggleVisible = () => {
    setVisible(!visible);
  };

  return (
    <Modal open={visible}>
      <Button
        type="button"
        size="sm"
        shape="circle"
        className="absolute right-2 top-2 rounded-full"
        onClick={toggleVisible}
      >
        ✕
      </Button>
      <Modal.Header className="font-bold">
        {t('configure-singlesignon')}
      </Modal.Header>
      <Modal.Body>
        <div className="mt-2 flex flex-col space-y-2">
          <CreateSAMLConnection
            successCallback={() => {
              toast.success(t('saml-config-updated'));
              setVisible(!visible);
              mutateSamlConfig();
            }}
            classNames={{ button: 'btn btn-primary mt-6' }}
            errorCallback={(errMessage) => {
              toast.error(errMessage);
            }}
            variant="basic"
            urls={{ save: `/api/teams/${team.slug}/saml` }}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CreateConnection;
