import { signIn } from 'next-auth/react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import useInvitation from 'hooks/useInvitation';
import env from '@/lib/env';

const LinkedInButton = () => {
  const { t } = useTranslation('common');
  const { invitation } = useInvitation();

  const callbackUrl = invitation
    ? `/invitations/${invitation.token}`
    : env.redirectIfAuthenticated;

  return (
    <Button
      className="btn btn-outline w-full"
      onClick={() => {
        signIn('linkedin', {
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
  data-icon="linkedin"
  role="img"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 448 512"
>
  <path
    fill="currentColor"
    d="M100.28 448H7.4V148.9h92.88zM53.79 108.1c-31.64 0-57.21-25.6-57.21-57.2C-3.43 19.6 22.14-6 53.79-6c31.64 0 57.21 25.6 57.21 57.2 0 31.64-25.57 57.1-57.21 57.1zM447.9 448h-92.86V302.4c0-34.71-.67-79.27-48.29-79.27-48.29 0-55.7 37.72-55.7 76.73V448h-92.78V148.9h89.07v40.89h1.27c12.41-23.4 42.72-48.29 87.87-48.29 93.95 0 111.3 61.86 111.3 142.3V448z"
  ></path>
</svg>
      {t('continue-with-linkedin')}
    </Button>
  );
};

export default LinkedInButton;
