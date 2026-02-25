import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import { Button, Input } from 'react-daisyui';
import { ArrowDownTrayIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const MdrSharePage = ({ token, shareInfo }) => {
  const [password, setPassword] = useState('');
  const [downloading, setDownloading] = useState(false);

  if (!shareInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
          <p className="text-gray-500">
            This share link does not exist or has expired.
          </p>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/mdr/share/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: shareInfo.hasPassword ? password : undefined }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || 'Failed to download');
        return;
      }

      window.open(json.data.downloadUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
        <div className="card-body">
          <h1 className="card-title text-xl">{shareInfo.projectName}</h1>
          {shareInfo.clientName && (
            <p className="text-sm text-gray-500">Client: {shareInfo.clientName}</p>
          )}

          <div className="divider" />

          <dl className="space-y-1 text-sm">
            {shareInfo.compilationDate && (
              <>
                <dt className="text-gray-500">Compiled</dt>
                <dd>{new Date(shareInfo.compilationDate).toLocaleDateString()}</dd>
              </>
            )}
            {shareInfo.fileSize && (
              <>
                <dt className="text-gray-500">File Size</dt>
                <dd>
                  {(Number(shareInfo.fileSize) / 1024 / 1024).toFixed(1)} MB
                </dd>
              </>
            )}
            <dt className="text-gray-500">Expires</dt>
            <dd>{new Date(shareInfo.expiresAt).toLocaleDateString()}</dd>
          </dl>

          {shareInfo.hasPassword && (
            <div className="mt-4">
              <label className="label">
                <span className="label-text flex items-center gap-1">
                  <LockClosedIcon className="h-4 w-4" />
                  Password required
                </span>
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full"
              />
            </div>
          )}

          <div className="card-actions justify-end mt-4">
            <Button
              color="primary"
              onClick={handleDownload}
              loading={downloading}
              disabled={downloading || (shareInfo.hasPassword && !password)}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Download MDR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps({
  locale,
  params,
}: GetServerSidePropsContext) {
  const token = params?.token as string;

  try {
    // Fetch share info server-side for SSR
    const baseUrl = process.env.APP_URL || 'http://localhost:4002';
    const res = await fetch(`${baseUrl}/api/mdr/share/${token}`);

    if (!res.ok) {
      return {
        props: {
          ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
          token,
          shareInfo: null,
        },
      };
    }

    const json = await res.json();

    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        token,
        shareInfo: json.data,
      },
    };
  } catch {
    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        token,
        shareInfo: null,
      },
    };
  }
}

export default MdrSharePage;
