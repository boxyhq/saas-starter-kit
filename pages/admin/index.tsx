import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import KpiCard from '@/components/admin/KpiCard';
import { Loading, Error } from '@/components/shared';
import env from '@/lib/env';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const AdminDashboard = () => {
  const { data, isLoading, error } = useSWR('/api/admin/stats', fetcher);

  const stats = data?.data;

  return (
    <AdminShell title="Admin Dashboard">
      {isLoading && <Loading />}
      {error && <Error message={error.message} />}
      {stats && (
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-4">Users</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Total Users" value={stats.totalUsers} />
              <KpiCard label="New (30d)" value={stats.newUsers} trend="up" colorClass="text-success" />
              <KpiCard label="Total Teams" value={stats.totalTeams} />
              <KpiCard label="Suspended Teams" value={stats.suspendedTeams} colorClass={stats.suspendedTeams > 0 ? 'text-error' : 'text-base-content'} />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-4">MDR Module</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="MDR Projects" value={stats.totalMdrProjects} />
              <KpiCard label="Total Documents" value={stats.totalDocuments} />
              <KpiCard label="Storage Used" value={formatBytes(stats.totalStorageBytes)} />
              <KpiCard
                label="Active Compilations"
                value={stats.activeCompilations}
                colorClass={stats.activeCompilations > 0 ? 'text-info' : 'text-base-content'}
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-4">Email Inbox (30d)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Inbound Emails" value={stats.inboundEmails30d} />
              <KpiCard label="Attachments" value={stats.inboundAttachments30d} />
              <KpiCard
                label="Failed Compilations"
                value={stats.failedCompilations}
                colorClass={stats.failedCompilations > 0 ? 'text-error' : 'text-base-content'}
              />
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions());
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };

  const adminEmails = env.adminEmails;
  const userEmail = (session.user as any)?.email;
  if (!adminEmails?.includes(userEmail)) {
    return { redirect: { destination: '/', permanent: false } };
  }

  return { props: {} };
}

export default AdminDashboard;
