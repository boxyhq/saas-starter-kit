import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { useState } from 'react';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error } from '@/components/shared';
import { Button, Select } from 'react-daisyui';
import env from '@/lib/env';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'badge-warning',
    PROCESSING: 'badge-info',
    COMPLETE: 'badge-success',
    FAILED: 'badge-error',
  };
  return map[status] ?? 'badge-neutral';
};

const AdminJobsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [retrying, setRetrying] = useState<string | null>(null);

  const { data, isLoading, error, mutate } = useSWR(
    `/api/admin/jobs${statusFilter ? `?status=${statusFilter}` : ''}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const handleRetry = async (compilationId: string) => {
    setRetrying(compilationId);
    try {
      const res = await fetch(`/api/admin/jobs/${compilationId}/retry`, { method: 'POST' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success('Compilation re-queued');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRetrying(null);
    }
  };

  const compilations = data?.data?.compilations ?? [];

  return (
    <AdminShell title="Compilation Jobs">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-sm">
            <Select.Option value="">All statuses</Select.Option>
            <Select.Option value="PENDING">Pending</Select.Option>
            <Select.Option value="PROCESSING">Processing</Select.Option>
            <Select.Option value="COMPLETE">Complete</Select.Option>
            <Select.Option value="FAILED">Failed</Select.Option>
          </Select>
          <Button size="sm" color="ghost" onClick={() => mutate()}>Refresh</Button>
        </div>

        {isLoading && <Loading />}
        {error && <Error message={error.message} />}

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Project</th>
                <th>Team</th>
                <th>Status</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {compilations.map((c: any) => (
                <tr key={c.id}>
                  <td className="text-sm font-medium">{c.mdrProject?.name}</td>
                  <td className="text-sm font-mono">{c.mdrProject?.team?.slug}</td>
                  <td>
                    <span className={`badge badge-sm ${statusBadge(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="text-sm">
                    {c.startedAt ? new Date(c.startedAt).toLocaleString() : '—'}
                  </td>
                  <td className="text-sm">
                    {c.completedAt ? new Date(c.completedAt).toLocaleString() : '—'}
                  </td>
                  <td className="text-sm">
                    {c.fileSize ? `${(Number(c.fileSize) / 1024 / 1024).toFixed(1)} MB` : '—'}
                  </td>
                  <td>
                    {c.status === 'FAILED' && (
                      <Button
                        size="xs"
                        color="warning"
                        onClick={() => handleRetry(c.id)}
                        disabled={retrying === c.id}
                        loading={retrying === c.id}
                      >
                        Retry
                      </Button>
                    )}
                    {c.errorMessage && (
                      <span className="text-xs text-error ml-1" title={c.errorMessage}>⚠ Error</span>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && compilations.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-base-content/50 py-8">No compilations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data?.data && (
          <p className="text-sm text-base-content/50">
            Showing {compilations.length} of {data.data.total} jobs
          </p>
        )}
      </div>
    </AdminShell>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions());
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const adminEmails = env.adminEmails;
  const userEmail = (session.user as any)?.email;
  if (!adminEmails?.includes(userEmail)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
}

export default AdminJobsPage;
