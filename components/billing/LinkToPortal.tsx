import toast from 'react-hot-toast';
import { Button } from 'react-daisyui';
import { useState } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

import { Card } from '@/components/shared';
import { Team } from '@prisma/client';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';

interface LinkToPortalProps {
  team: Team;
}

const LinkToPortal = ({ team }: LinkToPortalProps) => {
  const [loading, setLoading] = useState(false);

  const openStripePortal = async () => {
    setLoading(true);

    const response = await fetch(
      `/api/teams/${team.slug}/payments/create-portal-link`,
      {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'same-origin',
      }
    );

    const result = (await response.json()) as ApiResponse<{ url: string }>;

    if (!response.ok) {
      toast.error(result.error.message);
      return;
    }

    setLoading(false);
    window.open(result.data.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>Manage your subscription</Card.Title>
          <Card.Description>
            Manage your billing information, make edits to your details, and
            easily cancel your subscription.
          </Card.Description>
        </Card.Header>
        <div>
          <Button
            type="button"
            color="primary"
            size="sm"
            variant="outline"
            loading={loading}
            onClick={() => openStripePortal()}
          >
            Billing Portal
            <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LinkToPortal;
