import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import fetcher from '@/lib/fetcher';
import AdminShell from '@/components/admin/AdminShell';
import { Loading, Error as ErrorPanel } from '@/components/shared';
import { Button, Modal, Input, Textarea } from 'react-daisyui';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import env from '@/lib/env';

const AdminPlansPage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data, isLoading, error, mutate } = useSWR('/api/admin/plans', fetcher);

  const handleCreate = async () => {
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, isDefault }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success('Plan created');
      setShowCreate(false);
      setName('');
      setDescription('');
      setIsDefault(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (planId: string, planName: string) => {
    if (!confirm(`Delete plan "${planName}"? This cannot be undone.`)) return;
    setDeleting(planId);
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed');
      }
      toast.success('Plan deleted');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const plans = data?.data ?? [];

  return (
    <AdminShell title="Subscription Plans">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-base-content/60">
            Configure plan features and limits. Plans are linked to Stripe price IDs via the plan editor.
          </p>
          <Button color="primary" size="sm" onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4 mr-1" /> Add Plan
          </Button>
        </div>

        {isLoading && <Loading />}
        {error && <ErrorPanel message={error.message} />}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((plan: any) => (
            <div key={plan.id} className={`card bg-base-100 border-2 shadow-sm ${plan.isDefault ? 'border-primary' : 'border-base-300'}`}>
              <div className="card-body p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      {plan.isDefault && (
                        <span className="badge badge-primary badge-sm">Default</span>
                      )}
                      {!plan.isActive && (
                        <span className="badge badge-ghost badge-sm">Inactive</span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-sm text-base-content/60 mt-1">{plan.description}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Features</p>
                  <p className="text-sm">
                    {plan.features.filter((f: any) => f.enabled).length} / {plan.features.length} enabled
                  </p>
                  {plan.stripePriceId && (
                    <p className="text-xs font-mono text-base-content/40 truncate" title={plan.stripePriceId}>
                      {plan.stripePriceId}
                    </p>
                  )}
                </div>

                <div className="card-actions justify-end mt-4 gap-1">
                  <Button
                    size="xs"
                    color="ghost"
                    onClick={() => handleDelete(plan.id, plan.name)}
                    disabled={deleting === plan.id || plan.isDefault}
                    loading={deleting === plan.id}
                    title={plan.isDefault ? 'Cannot delete default plan' : 'Delete'}
                  >
                    <TrashIcon className="h-4 w-4 text-error" />
                  </Button>
                  <Link href={`/admin/plans/${plan.id}`}>
                    <Button size="xs" color="primary">
                      <PencilIcon className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && plans.length === 0 && (
            <div className="col-span-4 text-center py-16 text-base-content/40">
              No plans yet. Create one above or run the database seed.
            </div>
          )}
        </div>
      </div>

      <Modal.Legacy open={showCreate} onClickBackdrop={() => setShowCreate(false)}>
        <Modal.Header className="font-bold">Create Plan</Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Plan Name *</span></label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Professional" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Description</span></label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description…" rows={2} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <span className="text-sm">Set as default plan (for teams with no subscription)</span>
          </label>
        </Modal.Body>
        <Modal.Actions>
          <Button color="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button color="primary" onClick={handleCreate} disabled={creating || !name} loading={creating}>
            Create
          </Button>
        </Modal.Actions>
      </Modal.Legacy>
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

export default AdminPlansPage;
