import { InputWithCopyButton, InputWithLabel } from '@/components/shared';
import type { Team } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { toast } from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import type { ApiResponse } from 'types';
import Modal from '../shared/Modal';

const NewAPIKey = ({
  team,
  createModalVisible,
  setCreateModalVisible,
}: NewAPIKeyProps) => {
  const { mutate } = useSWRConfig();
  const [apiKey, setApiKey] = useState('');

  const onNewAPIKey = (apiKey: string) => {
    setApiKey(apiKey);
    mutate(`/api/teams/${team.slug}/api-keys`);
  };

  const toggleVisible = () => {
    setCreateModalVisible(!createModalVisible);
    setApiKey('');
  };

  return (
    <Modal open={createModalVisible} close={toggleVisible}>
      {apiKey === '' ? (
        <CreateAPIKeyForm
          team={team}
          onNewAPIKey={onNewAPIKey}
          closeModal={toggleVisible}
        />
      ) : (
        <DisplayAPIKey apiKey={apiKey} closeModal={toggleVisible} />
      )}
    </Modal>
  );
};

const CreateAPIKeyForm = ({
  team,
  onNewAPIKey,
  closeModal,
}: CreateAPIKeyFormProps) => {
  const [name, setName] = useState('');
  const { t } = useTranslation('common');
  const [submitting, setSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);

    const res = await fetch(`/api/teams/${team.slug}/api-keys`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    const { data, error } = (await res.json()) as ApiResponse<{
      apiKey: string;
    }>;

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.apiKey) {
      onNewAPIKey(data.apiKey);
      toast.success(t('api-key-created'));
    }
  };

  return (
    <form onSubmit={handleSubmit} method="POST">
      <Modal.Header>{t('new-api-key')}</Modal.Header>
      <Modal.Description>{t('new-api-key-description')}</Modal.Description>
      <Modal.Body>
        <InputWithLabel
          label={t('name')}
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My API Key"
          className="text-sm"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="outline" onClick={closeModal} size="md">
          {t('close')}
        </Button>
        <Button
          color="primary"
          type="submit"
          loading={submitting}
          disabled={!name}
          size="md"
        >
          {t('create-api-key')}
        </Button>
      </Modal.Footer>
    </form>
  );
};

const DisplayAPIKey = ({ apiKey, closeModal }: DisplayAPIKeyProps) => {
  const { t } = useTranslation('common');

  return (
    <>
      <Modal.Header>{t('new-api-key')}</Modal.Header>
      <Modal.Description>{t('new-api-warning')}</Modal.Description>
      <Modal.Body>
        <InputWithCopyButton
          label={t('api-key')}
          value={apiKey}
          className="text-sm"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="outline" onClick={closeModal} size="md">
          {t('close')}
        </Button>
      </Modal.Footer>
    </>
  );
};

interface NewAPIKeyProps {
  team: Team;
  createModalVisible: boolean;
  setCreateModalVisible: (visible: boolean) => void;
}

interface CreateAPIKeyFormProps {
  team: Team;
  onNewAPIKey: (apiKey: string) => void;
  closeModal: () => void;
}

interface DisplayAPIKeyProps {
  apiKey: string;
  closeModal: () => void;
}

export default NewAPIKey;
