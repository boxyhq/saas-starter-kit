import { Button } from 'react-daisyui';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';

import { Invitation } from '@prisma/client';

interface EmailDomainMismatchProps {
  invitation: Invitation;
  emailDomain: string;
}

const EmailDomainMismatch = ({
  invitation,
  emailDomain,
}: EmailDomainMismatchProps) => {
  const { t } = useTranslation('common');
  const { allowedDomains } = invitation;

  const allowedDomainsString =
    allowedDomains.length === 1
      ? `the domain: ${allowedDomains[0]}`
      : `one of the following domains: ${allowedDomains.join(', ')}`;

  return (
    <>
      <p className="text-sm text-center">
        {t('email-domain-not-allowed', { emailDomain, allowedDomainsString })}
      </p>
      <p className="text-sm text-center">
        {t('accept-invitation-email-domain-instruction')}
      </p>
      <Button
        fullWidth
        color="error"
        size="md"
        variant="outline"
        onClick={() => {
          signOut();
        }}
      >
        {t('logout')}
      </Button>
    </>
  );
};

export default EmailDomainMismatch;
