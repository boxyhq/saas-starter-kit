import { AuthLayout } from '@/components/layouts';
import Link from 'next/link';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from 'types';

const VerifyEmail: NextPageWithLayout = () => {
  return (
    <div className="rounded p-6 border">
      <div className="space-y-3 text-center">
        <h2 className="text-xl">Please verify your email</h2>
        <p className="text-base text-gray-600 pb-4">
          {`You're almost there! We just sent a verification link to your email.
          The link in the email will expire in 24 hours.`}
        </p>
        <Link href="/auth/login" className="btn btn-sm btn-outline">
          Go to login
        </Link>
      </div>
    </div>
  );
};

VerifyEmail.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default VerifyEmail;
