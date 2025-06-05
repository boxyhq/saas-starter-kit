import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { Button, Input } from 'react-daisyui';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';

const ScanForm = () => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ url, user_id: session?.user.id }),
    });
    const json = (await response.json()) as ApiResponse<{ id: string }>;
    setLoading(false);
    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }
    const id = (json.data as any)?.id;
    if (id) {
      router.push(`/scans/${id}`);
    } else {
      toast.success(t('successfully-updated'));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
      <Input
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full"
        required
      />
      <Button type="submit" color="primary" loading={loading} disabled={!url}>
        {t('new-scan')}
      </Button>
    </form>
  );
};

export default ScanForm;
