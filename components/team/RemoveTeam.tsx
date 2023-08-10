import { Card } from '@/components/shared';
import { Team } from '@prisma/client';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';

import ConfirmationDialog from '../shared/ConfirmationDialog';

const RemoveTeam = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [askConfirmation, setAskConfirmation] = useState(false);

  const removeTeam = async () => {
    setLoading(true);

    const response = await axios.delete(`/api/teams/${team.slug}`);

    setLoading(false);

    const { data, error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      toast.success(t('team-removed-successfully'));
      return router.push('/teams');
    }
  };

  return (
    <>
      <Card heading={t('remove-team')}>
        <Card.Body className="px-3 py-3">
          <p className="text-sm mb-4">{t('remove-team-warning')}</p>
          <Button
            color="error"
            onClick={() => setAskConfirmation(true)}
            loading={loading}
            variant="outline"
            size="md"
          >
            {t('remove-team')}
          </Button>
        </Card.Body>
      </Card>
      <ConfirmationDialog
        visible={askConfirmation}
        title={t('remove-team')}
        onCancel={() => setAskConfirmation(false)}
        onConfirm={removeTeam}
      >
        {t('remove-team-confirmation')}
      </ConfirmationDialog>
    </>
  );
};

export default RemoveTeam;
