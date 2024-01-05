import { Button } from 'react-daisyui';
import { signOut } from 'next-auth/react';

import { Invitation } from '@prisma/client';

interface EmailDomainMismatchProps {
  invitation: Invitation;
  emailDomain: string;
}

const EmailDomainMismatch = ({
  invitation,
  emailDomain,
}: EmailDomainMismatchProps) => {
  const { allowedDomain } = invitation;

  const allowedDomainsString =
    allowedDomain.length === 1
      ? `the domain: ${allowedDomain[0]}`
      : `one of the following domains: ${allowedDomain.join(', ')}`;

  return (
    <>
      <p className="text-sm text-center">{`Your email address domain ${emailDomain} is not allowed for this invitation. Please use an email with ${allowedDomainsString}.`}</p>
      <p className="text-sm text-center">
        To accept this invitation, you will need to sign out and then sign in or
        create a new account using the allowed email domains.
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
        Sign out
      </Button>
    </>
  );
};

export default EmailDomainMismatch;
