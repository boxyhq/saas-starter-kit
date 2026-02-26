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

const AdminUsersPage = () => {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [suspending, setSuspending] = useState<string | null>(null);

  const { data, isLoading, error, mutate } = useSWR(
    `/api/admin/users${search ? `?q=${encodeURIComponent(search)}` : ''}`,
    fetcher
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(q);
  };

  const handleSuspend = async (userId: string, suspended: boolean) => {
    setSuspending(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success(suspended ? 'User suspended' : 'User activated');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSuspending(null);
    }
  };

  const handleImpersonate = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}/impersonate`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error?.message || 'Failed');
      return;
    }
    window.location.href = json.data.redirectUrl;
  };

  const users = data?.data?.users ?? [];

  return (
    <AdminShell title="Users">
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by email or name…"
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
                <th>Email</th>
                <th>Name</th>
                <th>Teams</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id}>
                  <td>
                    <Link href={`/admin/users/${user.id}`} className="link link-hover font-medium">
                      {user.email}
                    </Link>
                  </td>
                  <td className="text-sm">{user.name ?? '—'}</td>
                  <td className="text-sm">
                    {user.teamMembers.slice(0, 2).map((m: any) => m.team.slug).join(', ')}
                    {user.teamMembers.length > 2 && ` +${user.teamMembers.length - 2}`}
                  </td>
                  <td className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.suspended ? (
                      <span className="badge badge-error badge-sm">Suspended</span>
                    ) : (
                      <span className="badge badge-success badge-sm">Active</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Button
                        size="xs"
                        color={user.suspended ? 'success' : 'error'}
                        onClick={() => handleSuspend(user.id, !user.suspended)}
                        disabled={suspending === user.id}
                        loading={suspending === user.id}
                      >
                        {user.suspended ? 'Activate' : 'Suspend'}
                      </Button>
                      <Button
                        size="xs"
                        color="warning"
                        onClick={() => handleImpersonate(user.id)}
                      >
                        Impersonate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-base-content/50 py-8">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data?.data && (
          <p className="text-sm text-base-content/50">
            Showing {users.length} of {data.data.total} users
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

export default AdminUsersPage;
