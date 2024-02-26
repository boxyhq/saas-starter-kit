import { signIn } from 'next-auth/react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import useInvitation from 'hooks/useInvitation';
import env from '@/lib/env';

const GoogleButton = () => {
  const { t } = useTranslation('common');
  const { invitation } = useInvitation();

  const callbackUrl = invitation
    ? `/invitations/${invitation.token}`
    : env.redirectIfAuthenticated;

  return (
    <Button
      className="btn btn-outline w-full"
      onClick={() => {
        signIn('google', {
          callbackUrl,
        });
      }}
      size="md"
    >
      <svg
        className="mr-2 -ml-1 h-4 w-4"
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="google"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 488 512"
      >
        <path
          fill="currentColor"
          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
        ></path>
      </svg>
      {t('continue-with-google')}
    </Button>
  );
};

export default GoogleButton;
