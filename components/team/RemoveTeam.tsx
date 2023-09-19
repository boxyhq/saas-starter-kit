import { Card } from '@/components/shared';
import { Team } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';

import ConfirmationDialog from '../shared/ConfirmationDialog';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';

const RemoveTeam = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [askConfirmation, setAskConfirmation] = useState(false);

  const removeTeam = async () => {
    setLoading(true);

    const response = await fetch(`/api/teams/${team.slug}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    const json = (await response.json()) as ApiResponse;

    setLoading(false);

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('team-removed-successfully'));
    router.push('/teams');
  };

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('remove-team')}</Card.Title>
            <Card.Description>{t('remove-team-warning')}</Card.Description>
          </Card.Header>
        </Card.Body>
        <Card.Footer>
          <Button
            color="error"
            onClick={() => setAskConfirmation(true)}
            loading={loading}
            variant="outline"
            size="md"
          >
            {t('remove-team')}
          </Button>
        </Card.Footer>
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
