import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error as ErrorPanel } from '@/components/shared';
import { Button, Input, Select } from 'react-daisyui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import env from '@/lib/env';

const AdminUserDetailPage = () => {
  const router = useRouter();
  const { userId } = router.query as { userId: string };

  const { data, isLoading, error, mutate } = useSWR(
    userId ? `/api/admin/users/${userId}` : null,
    fetcher
  );
  const { data: plansData } = useSWR('/api/admin/plans', fetcher);

  const [suspending, setSuspending] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [planId, setPlanId] = useState('');
  const [trialEndsAt, setTrialEndsAt] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);

  const user = data?.data;
  const plans = plansData?.data ?? [];

  const handleSuspend = async () => {
    setSuspending(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: !user.suspended }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success(user.suspended ? 'User activated' : 'User suspended');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSuspending(false);
    }
  };

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/impersonate`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      window.location.href = json.data.redirectUrl;
    } catch (err: any) {
      toast.error(err.message);
      setImpersonating(false);
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlan(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planId || null,
          trialEndsAt: trialEndsAt || null,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success('Plan assigned to owned teams');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <AdminShell title="User Detail">
      <div className="mb-4">
        <Link href="/admin/users" className="btn btn-ghost btn-sm gap-1">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Users
        </Link>
      </div>

      {isLoading && <Loading />}
      {error && <ErrorPanel message={error.message} />}

      {user && (
        <div className="space-y-6 max-w-3xl">
          {/* Identity */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">{user.name ?? '(no name)'}</h2>
                  <p className="text-base-content/60">{user.email}</p>
                  <p className="text-xs text-base-content/40 mt-1">
                    ID: <span className="font-mono">{user.id}</span>
                  </p>
                  <p className="text-xs text-base-content/40">
                    Joined: {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-2">
                    {user.suspended ? (
                      <span className="badge badge-error">Suspended</span>
                    ) : (
                      <span className="badge badge-success">Active</span>
                    )}
                    {user.twoFactorEnabled && (
                      <span className="badge badge-info">2FA</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color={user.suspended ? 'success' : 'error'}
                      onClick={handleSuspend}
                      disabled={suspending}
                      loading={suspending}
                    >
                      {user.suspended ? 'Activate' : 'Suspend'}
                    </Button>
                    <Button
                      size="sm"
                      color="warning"
                      onClick={handleImpersonate}
                      disabled={impersonating}
                      loading={impersonating}
                    >
                      Impersonate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teams */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold mb-3">Team Memberships</h3>
              {user.teamMembers.length === 0 ? (
                <p className="text-sm text-base-content/50">No team memberships</p>
              ) : (
                <div className="space-y-2">
                  {user.teamMembers.map((m: any) => (
                    <div key={m.team.id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                      <div>
                        <Link href={`/admin/teams/${m.team.slug}`} className="link font-medium text-sm">
                          {m.team.name}
                        </Link>
                        <span className="text-xs text-base-content/50 ml-2 font-mono">{m.team.slug}</span>
                        {m.team.suspended && <span className="badge badge-error badge-xs ml-2">suspended</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-outline badge-sm">{m.role}</span>
                        <span className="text-xs text-base-content/50">{m.team.mdrProjects?.length ?? 0} MDRs</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MDR Project Memberships */}
          {user.mdrProjectMemberships?.length > 0 && (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h3 className="font-semibold mb-3">MDR Project Memberships</h3>
                <div className="space-y-1">
                  {user.mdrProjectMemberships.map((m: any) => (
                    <div key={m.mdrProject.id} className="flex items-center justify-between text-sm px-2 py-1">
                      <span>{m.mdrProject.name}</span>
                      <span className="badge badge-outline badge-xs">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Assign Plan */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold mb-1">Assign Plan Override</h3>
              <p className="text-xs text-base-content/50 mb-3">
                Sets trialPlanId on all teams where this user is OWNER. Leave plan empty to remove override.
              </p>
              <form onSubmit={handleAssignPlan} className="flex flex-wrap gap-3 items-end">
                <div className="form-control">
                  <label className="label label-text text-xs">Plan</label>
                  <Select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="select-sm min-w-40"
                  >
                    <option value="">— Remove override —</option>
                    {plans.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="form-control">
                  <label className="label label-text text-xs">Trial ends at (optional)</label>
                  <Input
                    type="datetime-local"
                    value={trialEndsAt}
                    onChange={(e) => setTrialEndsAt(e.target.value)}
                    className="input-sm"
                  />
                </div>
                <Button type="submit" size="sm" color="primary" loading={savingPlan} disabled={savingPlan}>
                  Save Plan
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
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

export default AdminUserDetailPage;
