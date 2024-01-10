import { Button } from 'react-daisyui';
import { signOut } from 'next-auth/react';

interface EmailMismatchProps {
  email: string;
}

const EmailMismatch = ({ email }: EmailMismatchProps) => {
  return (
    <>
      <p className="text-sm text-center">{`Your email address ${email} does not match the email address this invitation was sent to.`}</p>
      <p className="text-sm text-center">
        To accept this invitation, you will need to sign out and then sign in or
        create a new account using the same email address used in the
        invitation.
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

export default EmailMismatch;
