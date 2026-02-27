import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import toast from 'react-hot-toast';
import { Button, Input } from 'react-daisyui';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const TwoFactorChallengePage = () => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const returnUrl = (router.query.returnUrl as string) || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Invalid code');
      router.push(returnUrl);
    } catch (err: any) {
      toast.error(err.message);
      setToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <ShieldCheckIcon className="h-12 w-12 text-primary mb-2" />
          <h1 className="card-title text-xl">Two-Factor Authentication</h1>
          <p className="text-sm text-base-content/60 mb-4">
            Enter the 6-digit code from your authenticator app.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9 ]*"
              maxLength={7}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="000 000"
              className="text-center text-2xl tracking-widest w-full"
              autoFocus
              autoComplete="one-time-code"
            />

            <Button
              type="submit"
              color="primary"
              className="w-full"
              loading={loading}
              disabled={loading || token.replace(/\s/g, '').length < 6}
            >
              Verify
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session) {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  return { props: {} };
}

export default TwoFactorChallengePage;
