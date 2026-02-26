import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { useState } from 'react';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error as ErrorPanel } from '@/components/shared';
import { Button } from 'react-daisyui';
import { CloudArrowUpIcon, ClipboardDocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import env from '@/lib/env';

const AdminCmsMediaPage = () => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data, isLoading, error, mutate } = useSWR('/api/admin/cms/media', fetcher);
  const assets = data?.data?.assets ?? [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // 1. Get presigned URL + create asset record
      const urlRes = await fetch('/api/admin/cms/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, mimeType: file.type, fileSize: file.size }),
      });
      const urlJson = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlJson.error?.message || 'Failed to get upload URL');

      const { uploadUrl } = urlJson.data;

      // 2. Upload to S3
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

      toast.success('Image uploaded!');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCopy = (s3Key: string) => {
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET ?? '';
    const region = process.env.NEXT_PUBLIC_S3_REGION ?? 'us-east-1';
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
    navigator.clipboard.writeText(url).then(() => toast.success('URL copied!'));
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Delete this image?')) return;
    setDeleting(assetId);
    try {
      const res = await fetch(`/api/admin/cms/media/${assetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error?.message || 'Failed');
      toast.success('Image deleted');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminShell title="Media Library">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-base-content/60">Upload images for use in CMS pages.</p>
          <label className={`btn btn-primary btn-sm cursor-pointer ${uploading ? 'loading' : ''}`}>
            <CloudArrowUpIcon className="h-4 w-4 mr-1" /> Upload Image
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {isLoading && <Loading />}
        {error && <ErrorPanel message={error.message} />}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {assets.map((asset: any) => (
            <div key={asset.id} className="group relative border border-base-300 rounded-lg overflow-hidden bg-base-200">
              <div className="aspect-square flex items-center justify-center text-base-content/30 text-xs p-2 text-center">
                {asset.mimeType.startsWith('image/') ? (
                  <span className="text-3xl">🖼</span>
                ) : (
                  <span>📄</span>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-base-content/60 truncate" title={asset.filename}>{asset.filename}</p>
                {asset.alt && <p className="text-xs text-base-content/40 truncate">Alt: {asset.alt}</p>}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <Button size="xs" color="ghost" onClick={() => handleCopy(asset.s3Key)} title="Copy URL" className="text-white">
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="xs" color="ghost"
                  onClick={() => handleDelete(asset.id)}
                  disabled={deleting === asset.id}
                  loading={deleting === asset.id}
                  title="Delete"
                  className="text-red-300"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {!isLoading && assets.length === 0 && (
            <div className="col-span-6 text-center py-12 text-base-content/40">No images yet.</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const adminEmails = env.adminEmails;
  if (!adminEmails?.includes((session.user as any)?.email)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
}

export default AdminCmsMediaPage;
