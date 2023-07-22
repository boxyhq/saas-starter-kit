import { AuthLayout } from '@/components/layouts';
import type { ReactElement } from 'react';

const VerifyEmail = () => {
  return (
    <div className="rounded p-6 border">
      <div className="space-y-3">
        <h2>Confirm your email address</h2>
        <p className="text-base text-gray-600">
          To complete the signup process, click the link in the email we sent
          you.
        </p>
        <p className="text-base text-gray-600">
          If your verification email is not in your Inbox, you may wish to check
          your Spam folder.
        </p>
      </div>
    </div>
  );
};

VerifyEmail.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout
      heading="Awaiting email verification"
      description="Please confirm your email address to activate your account."
    >
      {page}
    </AuthLayout>
  );
};

export default VerifyEmail;
