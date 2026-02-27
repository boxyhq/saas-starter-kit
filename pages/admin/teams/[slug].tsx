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

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const AdminTeamDetailPage = () => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const { data, isLoading, error, mutate } = useSWR(
    slug ? `/api/admin/teams/${slug}` : null,
    fetcher
  );
  const { data: plansData } = useSWR('/api/admin/plans', fetcher);

  const [suspending, setSuspending] = useState(false);
  const [quota, setQuota] = useState('');
  const [savingQuota, setSavingQuota] = useState(false);
  const [planId, setPlanId] = useState('');
  const [trialEndsAt, setTrialEndsAt] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);

  const team = data?.data;
  const plans = plansData?.data ?? [];

  const handleSuspend = async () => {
    setSuspending(true);
    try {
      const res = await fetch(`/api/admin/teams/${slug}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: !team.suspended }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success(team.suspended ? 'Team activated' : 'Team suspended');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSuspending(false);
    }
  };

  const handleSaveQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingQuota(true);
    try {
      const val = quota === '' ? null : parseInt(quota, 10);
      const res = await fetch(`/api/admin/teams/${slug}/quota`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mdrQuotaOverride: val }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success('Quota override saved');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingQuota(false);
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlan(true);
    try {
      const res = await fetch(`/api/admin/teams/${slug}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planId || null,
          trialEndsAt: trialEndsAt ? new Date(trialEndsAt).toISOString() : null,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success('Plan override saved');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <AdminShell title="Team Detail">
      <div className="mb-4">
        <Link href="/admin/teams" className="btn btn-ghost btn-sm gap-1">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Teams
        </Link>
      </div>

      {isLoading && <Loading />}
      {error && <ErrorPanel message={error.message} />}

      {team && (
        <div className="space-y-6 max-w-3xl">
          {/* Identity */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">{team.name}</h2>
                  <p className="font-mono text-sm text-base-content/60">{team.slug}</p>
                  <p className="text-xs text-base-content/40 mt-1">
                    Created: {new Date(team.createdAt).toLocaleString()}
                  </p>
                  {team.trialPlanId && (
                    <p className="text-xs text-info mt-1">
                      Plan override active
                      {team.trialEndsAt && ` (expires ${new Date(team.trialEndsAt).toLocaleDateString()})`}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {team.suspended ? (
                    <span className="badge badge-error">Suspended</span>
                  ) : (
                    <span className="badge badge-success">Active</span>
                  )}
                  <Button
                    size="sm"
                    color={team.suspended ? 'success' : 'error'}
                    onClick={handleSuspend}
                    disabled={suspending}
                    loading={suspending}
                  >
                    {team.suspended ? 'Activate' : 'Suspend'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold mb-3">Members ({team.members?.length ?? 0})</h3>
              <div className="space-y-1">
                {(team.members ?? []).map((m: any) => (
                  <div key={m.user.id} className="flex items-center justify-between text-sm px-2 py-1 hover:bg-base-200 rounded">
                    <div>
                      <Link href={`/admin/users/${m.user.id}`} className="link font-medium">
                        {m.user.name ?? m.user.email}
                      </Link>
                      <span className="text-xs text-base-content/50 ml-2">{m.user.email}</span>
                    </div>
                    <span className="badge badge-outline badge-xs">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MDR Projects */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold mb-3">MDR Projects ({team.mdrProjects?.length ?? 0})</h3>
              {(team.mdrProjects ?? []).length === 0 ? (
                <p className="text-sm text-base-content/50">No MDR projects</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Sections</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.mdrProjects.map((p: any) => (
                        <tr key={p.id}>
                          <td className="font-medium">{p.name}</td>
                          <td><span className="badge badge-outline badge-xs">{p.status}</span></td>
                          <td>{p._count?.sections ?? 0}</td>
                          <td className="text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quota Override */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold mb-1">MDR Quota Override</h3>
              <p className="text-xs text-base-content/50 mb-3">
                Current: {team.mdrQuotaOverride === null ? 'no override (uses plan default)' :
                  team.mdrQuotaOverride === -1 ? 'unlimited' : team.mdrQuotaOverride}
              </p>
              <form onSubmit={handleSaveQuota} className="flex gap-3 items-end">
                <div className="form-control">
                  <label className="label label-text text-xs">Override value (-1 = unlimited, empty = remove)</label>
                  <Input
                    type="number"
                    min="-1"
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    placeholder={team.mdrQuotaOverride !== null ? String(team.mdrQuotaOverride) : 'no override'}
                    className="input-sm w-40"
                  />
                </div>
                <Button type="submit" size="sm" color="primary" loading={savingQuota} disabled={savingQuota}>
                  Save Quota
                </Button>
              </form>
            </div>
          </div>

          {/* Plan Override */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold mb-1">Assign Plan Override</h3>
              <p className="text-xs text-base-content/50 mb-3">
                Bypasses Stripe subscription for feature gating. Leave plan empty to remove.
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

export default AdminTeamDetailPage;
