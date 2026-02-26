import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { useState } from 'react';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error as ErrorPanel } from '@/components/shared';
import { Button, Input } from 'react-daisyui';
import Link from 'next/link';
import env from '@/lib/env';

const AdminTeamsPage = () => {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [suspending, setSuspending] = useState<string | null>(null);

  const { data, isLoading, error, mutate } = useSWR(
    `/api/admin/teams${search ? `?q=${encodeURIComponent(search)}` : ''}`,
    fetcher
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(q);
  };

  const handleSuspend = async (slug: string, suspended: boolean) => {
    setSuspending(slug);
    try {
      const res = await fetch(`/api/admin/teams/${slug}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success(suspended ? 'Team suspended' : 'Team activated');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSuspending(null);
    }
  };

  const teams = data?.data?.teams ?? [];

  return (
    <AdminShell title="Teams">
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or slug…"
            className="max-w-sm"
          />
          <Button type="submit" size="sm" color="primary">Search</Button>
        </form>

        {isLoading && <Loading />}
        {error && <ErrorPanel message={error.message} />}

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Name</th>
                <th>Members</th>
                <th>MDR Projects</th>
                <th>Quota Override</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team: any) => (
                <tr key={team.id}>
                  <td>
                    <Link href={`/admin/teams/${team.slug}`} className="link link-hover font-mono text-sm">
                      {team.slug}
                    </Link>
                  </td>
                  <td className="font-medium">{team.name}</td>
                  <td>{team._count?.members ?? 0}</td>
                  <td>{team._count?.mdrProjects ?? 0}</td>
                  <td className="text-sm">
                    {team.mdrQuotaOverride !== null ? (
                      <span className="badge badge-info badge-sm">
                        {team.mdrQuotaOverride === -1 ? '∞' : team.mdrQuotaOverride}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {team.suspended ? (
                      <span className="badge badge-error badge-sm">Suspended</span>
                    ) : (
                      <span className="badge badge-success badge-sm">Active</span>
                    )}
                  </td>
                  <td>
                    <Button
                      size="xs"
                      color={team.suspended ? 'success' : 'error'}
                      onClick={() => handleSuspend(team.slug, !team.suspended)}
                      disabled={suspending === team.slug}
                      loading={suspending === team.slug}
                    >
                      {team.suspended ? 'Activate' : 'Suspend'}
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && teams.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-base-content/50 py-8">No teams found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data?.data && (
          <p className="text-sm text-base-content/50">
            Showing {teams.length} of {data.data.total} teams
          </p>
        )}
      </div>
    </AdminShell>
  );
};

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const adminEmails = env.adminEmails;
  const userEmail = (session.user as any)?.email;
  if (!adminEmails?.includes(userEmail)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
}

export default AdminTeamsPage;
