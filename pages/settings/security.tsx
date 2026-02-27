import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

import env from '@/lib/env';
import { UpdatePassword } from '@/components/account';
import ManageSessions from '@/components/account/ManageSessions';

type SecurityProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const TwoFactorSection = () => {
  const { data: session, update } = useSession();
  const user = session?.user as any;
  const enabled = !!user?.twoFactorEnabled;

  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'disable'>('idle');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      setSecret(json.data.secret);
      // Generate QR code from the otpauth URL
      const dataUrl = await QRCode.toDataURL(json.data.otpauthUrl);
      setQrDataUrl(dataUrl);
      setStep('setup');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Invalid code');
      toast.success('Two-factor authentication enabled');
      setStep('idle');
      setCode('');
      await update();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const disableWithCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Invalid code');
      toast.success('Two-factor authentication disabled');
      setStep('idle');
      setCode('');
      await update();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-base-300 rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-base">Two-Factor Authentication</h3>
          <p className="text-sm text-base-content/60 mt-1">
            Add an extra layer of security to your account using an authenticator app.
          </p>
        </div>
        <span className={`badge ${enabled ? 'badge-success' : 'badge-ghost'} badge-sm`}>
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {step === 'idle' && (
        <div>
          {enabled ? (
            <button
              className="btn btn-sm btn-error btn-outline"
              onClick={() => setStep('disable')}
            >
              Disable 2FA
            </button>
          ) : (
            <button
              className="btn btn-sm btn-primary"
              onClick={startSetup}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs" /> : 'Enable 2FA'}
            </button>
          )}
        </div>
      )}

      {step === 'setup' && qrDataUrl && (
        <div className="space-y-4">
          <p className="text-sm">
            Scan this QR code with your authenticator app (e.g. Google Authenticator, Authy):
          </p>
          <img src={qrDataUrl} alt="2FA QR Code" className="w-48 h-48 rounded border border-base-300" />
          {secret && (
            <p className="text-xs text-base-content/50">
              Manual entry key: <code className="bg-base-200 px-1 rounded">{secret}</code>
            </p>
          )}
          <p className="text-sm font-medium">Enter the 6-digit code from your app to confirm:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="input input-bordered input-sm w-36 font-mono tracking-widest"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <button
              className="btn btn-sm btn-primary"
              onClick={verifyCode}
              disabled={code.length !== 6 || loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs" /> : 'Verify'}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => { setStep('idle'); setCode(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'disable' && (
        <div className="space-y-3">
          <p className="text-sm">Enter the current 6-digit code from your authenticator app to disable 2FA:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="input input-bordered input-sm w-36 font-mono tracking-widest"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <button
              className="btn btn-sm btn-error"
              onClick={disableWithCode}
              disabled={code.length !== 6 || loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs" /> : 'Disable 2FA'}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => { setStep('idle'); setCode(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Security = ({ sessionStrategy }: SecurityProps) => {
  return (
    <div className="flex gap-10 flex-col">
      <UpdatePassword />
      <TwoFactorSection />
      {sessionStrategy === 'database' && <ManageSessions />}
    </div>
  );
};

export const getServerSideProps = async ({
  locale,
}: GetServerSidePropsContext) => {
  const { sessionStrategy } = env.nextAuth;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      sessionStrategy,
    },
  };
};

export default Security;
