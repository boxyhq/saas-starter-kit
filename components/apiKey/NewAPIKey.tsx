import { InputWithCopyButton, InputWithLabel } from '@/components/shared';
import type { Team } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { Button, Modal } from 'react-daisyui';
import { toast } from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import type { ApiResponse } from 'types';

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
    <Modal open={createModalVisible} className="p-8">
      <Button
        type="button"
        size="sm"
        shape="circle"
        className="absolute right-2 top-2 rounded-full btn-outline"
        onClick={toggleVisible}
      >
        ✕
      </Button>
      {apiKey === '' ? (
        <CreateAPIKeyForm team={team} onNewAPIKey={onNewAPIKey} />
      ) : (
        <DisplayAPIKey apiKey={apiKey} />
      )}
    </Modal>
  );
};

const CreateAPIKeyForm = ({ team, onNewAPIKey }: CreateAPIKeyFormProps) => {
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
      <Modal.Header className="flex flex-col space-y-2">
        <h2 className="font-bold">{t('new-api-key')}</h2>
        <p className="text-sm text-gray-500">{t('new-api-key-description')}</p>
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col space-y-3 mt-4">
          <InputWithLabel
            label={t('name')}
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </Modal.Body>
      <Modal.Actions>
        <Button
          color="primary"
          type="submit"
          loading={submitting}
          disabled={!name}
          size="md"
        >
          {t('create-api-key')}
        </Button>
      </Modal.Actions>
    </form>
  );
};

const DisplayAPIKey = ({ apiKey }: DisplayAPIKeyProps) => {
  const { t } = useTranslation('common');

  return (
    <>
      <Modal.Header className="flex flex-col space-y-2">
        <h2 className="font-bold">{t('new-api-key')}</h2>
        <p className="text-sm text-gray-500">{t('new-api-warning')}</p>
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col space-y-3 mt-4">
          <InputWithCopyButton label={t('api-key')} value={apiKey} />
        </div>
      </Modal.Body>
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
}

interface DisplayAPIKeyProps {
  apiKey: string;
}

export default NewAPIKey;
