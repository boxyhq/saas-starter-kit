import { Card } from '@/components/ui';
import { Team } from '@prisma/client';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';

const RemoveTeam = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = React.useState(false);

  const removeTeam = async () => {
    const confirm = window.confirm(
      'Are you sure you want to remove this team? This action cannot be undone.'
    );

    if (!confirm) return;

    setLoading(true);

    const response = await axios.delete(`/api/teams/${team.slug}`);

    setLoading(false);

    const { data, error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      toast.success('Team removed successfully!');
      return router.push('/teams');
    }
  };

  return (
    <Card heading="Remove Team">
      <Card.Body className="px-3 py-3">
        <div className="space-y-3">
          <p className="text-sm">{t('remove-team-warning')}</p>
          <Button
            color="error"
            size="sm"
            onClick={removeTeam}
            loading={loading}
            className="text-white"
          >
            {t('remove-team')}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RemoveTeam;
