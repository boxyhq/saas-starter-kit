import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import PlanFeatureMatrix, { FeatureRow } from '@/components/admin/PlanFeatureMatrix';
import { Loading, Error as ErrorPanel } from '@/components/shared';
import { Button, Input, Textarea } from 'react-daisyui';
import env from '@/lib/env';

const AdminPlanEditorPage = () => {
  const router = useRouter();
  const { planId } = router.query as { planId: string };

  const { data, isLoading, error, mutate } = useSWR(
    planId ? `/api/admin/plans/${planId}` : null,
    fetcher
  );

  const plan = data?.data;

  // Metadata form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stripeProductId, setStripeProductId] = useState('');
  const [stripePriceId, setStripePriceId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  // Feature state
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [savingFeatures, setSavingFeatures] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.name ?? '');
      setDescription(plan.description ?? '');
      setStripeProductId(plan.stripeProductId ?? '');
      setStripePriceId(plan.stripePriceId ?? '');
      setSortOrder(plan.sortOrder ?? 0);
      setIsActive(plan.isActive ?? true);
      setIsDefault(plan.isDefault ?? false);
      setFeatures(
        (plan.features ?? []).map((f: any) => ({
          feature: f.feature,
          enabled: f.enabled,
          limit: f.limit ?? null,
        }))
      );
    }
  }, [plan]);

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          stripeProductId: stripeProductId || null,
          stripePriceId: stripePriceId || null,
          sortOrder,
          isActive,
          isDefault,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success('Plan details saved');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingMeta(false);
    }
  };

  const handleSaveFeatures = async () => {
    setSavingFeatures(true);
    try {
      const res = await fetch(`/api/admin/plans/${planId}/features`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success('Features saved');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingFeatures(false);
    }
  };

  if (isLoading) return <AdminShell><Loading /></AdminShell>;
  if (error) return <AdminShell><ErrorPanel message={error.message} /></AdminShell>;

  return (
    <AdminShell title={`Plan: ${plan?.name ?? '…'}`}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: metadata */}
        <div className="xl:col-span-1">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body space-y-4">
              <h2 className="card-title text-base">Plan Details</h2>

              <div className="form-control">
                <label className="label"><span className="label-text">Name *</span></label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Description</span></label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Stripe Product ID</span></label>
                <Input
                  value={stripeProductId}
                  onChange={(e) => setStripeProductId(e.target.value)}
                  placeholder="prod_…"
                  className="font-mono text-sm"
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Stripe Price ID</span></label>
                <Input
                  value={stripePriceId}
                  onChange={(e) => setStripePriceId(e.target.value)}
                  placeholder="price_…"
                  className="font-mono text-sm"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/40">
                    Must match the priceId on the Subscription record
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Sort Order</span></label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-24"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="toggle toggle-sm toggle-success"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="toggle toggle-sm toggle-primary"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                  />
                  <span className="text-sm">Default plan (no subscription)</span>
                </label>
              </div>

              <Button
                color="primary"
                size="sm"
                onClick={handleSaveMeta}
                disabled={savingMeta || !name}
                loading={savingMeta}
                className="w-full"
              >
                Save Details
              </Button>
            </div>
          </div>
        </div>

        {/* Right: feature matrix */}
        <div className="xl:col-span-2">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title text-base">Feature Matrix</h2>
                <Button
                  color="primary"
                  size="sm"
                  onClick={handleSaveFeatures}
                  disabled={savingFeatures}
                  loading={savingFeatures}
                >
                  Save Features
                </Button>
              </div>
              <PlanFeatureMatrix features={features} onChange={setFeatures} />
            </div>
          </div>
        </div>
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

export default AdminPlanEditorPage;
