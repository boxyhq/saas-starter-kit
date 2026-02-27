import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error as ErrorPanel, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import MdrProgressBar from '@/components/mdr/MdrProgressBar';
import { Button, Modal } from 'react-daisyui';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MdrProjectDashboard = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeOption, setFinalizeOption] = useState<'KEEP' | 'ARCHIVE'>('KEEP');
  const [finalizing, setFinalizing] = useState(false);

  const { data, mutate } = useSWR(
    team?.slug && mdrId
      ? `/api/teams/${team.slug}/mdr/${mdrId}`
      : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPanel message={isError.message} />;
  if (!team) return <ErrorPanel message={t('team-not-found')} />;

  const project = data?.data;

  if (!project) return <Loading />;

  const isFinal = project.status === 'FINAL';

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      const res = await fetch(`/api/teams/${team.slug}/mdr/${mdrId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FINAL', finalizeOption }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to finalize project');
      toast.success('Project finalized and locked.');
      setShowFinalizeModal(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <MdrNavTabs
        activeTab="overview"
        teamSlug={team.slug}
        mdrId={mdrId}
        projectName={project.name}
      />

      {/* FINAL read-only banner */}
      {isFinal && (
        <div className="alert alert-warning flex items-center gap-3 rounded-lg">
          <LockClosedIcon className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Project Finalized — Read-Only</p>
            <p className="text-sm">
              This project has been finalized. No further edits, uploads, or new
              transmittals are permitted.
            </p>
          </div>
        </div>
      )}

      <MdrProgressBar teamSlug={team.slug} mdrId={mdrId} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-title">Sections</div>
          <div className="stat-value text-primary">
            {project._count?.sections ?? 0}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-title">Members</div>
          <div className="stat-value text-secondary">
            {project._count?.members ?? 0}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-title">Compilations</div>
          <div className="stat-value text-accent">
            {project._count?.compilations ?? 0}
          </div>
        </div>
      </div>

      <div className="bg-base-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="font-semibold">Project Details</h2>
          {!isFinal && (
            <Button
              size="sm"
              color="warning"
              onClick={() => setShowFinalizeModal(true)}
            >
              <LockClosedIcon className="h-4 w-4 mr-1" />
              Finalize Project
            </Button>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {project.clientName && (
            <>
              <dt className="text-gray-500">Client</dt>
              <dd>{project.clientName}</dd>
            </>
          )}
          {project.projectNumber && (
            <>
              <dt className="text-gray-500">Project Number</dt>
              <dd>{project.projectNumber}</dd>
            </>
          )}
          {project.discipline && (
            <>
              <dt className="text-gray-500">Discipline</dt>
              <dd>{project.discipline}</dd>
            </>
          )}
          <dt className="text-gray-500">Status</dt>
          <dd>
            <span
              className={`badge badge-sm ${
                project.status === 'ACTIVE'
                  ? 'badge-success'
                  : project.status === 'ARCHIVED'
                  ? 'badge-warning'
                  : 'badge-neutral'
              }`}
            >
              {t(`mdr-project-${project.status.toLowerCase()}`)}
            </span>
          </dd>
        </dl>
      </div>

      {project.compilations?.[0] && (
        <div className="bg-base-200 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Latest Compilation</h2>
          <div className="flex items-center gap-2">
            <span
              className={`badge ${
                project.compilations[0].status === 'COMPLETE'
                  ? 'badge-success'
                  : project.compilations[0].status === 'FAILED'
                  ? 'badge-error'
                  : 'badge-warning'
              }`}
            >
              {project.compilations[0].status}
            </span>
            {project.compilations[0].completedAt && (
              <span className="text-sm text-gray-500">
                {new Date(
                  project.compilations[0].completedAt
                ).toLocaleDateString()}
              </span>
            )}
            {project.compilations[0].status === 'COMPLETE' && (
              <Link
                href={`/teams/${team.slug}/mdr/${mdrId}/compile`}
                className="link link-primary text-sm"
              >
                Download
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Finalize confirmation modal */}
      <Modal.Legacy
        open={showFinalizeModal}
        onClickBackdrop={() => !finalizing && setShowFinalizeModal(false)}
      >
        <Modal.Header className="font-bold flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-warning" />
          Finalize Project
        </Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="alert alert-warning text-sm">
            <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
            <span>
              <strong>This action is irreversible.</strong> Once finalized, the
              project will become read-only — no further uploads, section edits,
              or new transmittals will be allowed.
            </span>
          </div>

          <p className="text-sm font-medium">
            What should happen to the original source documents after finalization?
          </p>

          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-base-300 hover:border-primary transition-colors">
              <input
                type="radio"
                className="radio radio-primary mt-0.5"
                checked={finalizeOption === 'KEEP'}
                onChange={() => setFinalizeOption('KEEP')}
              />
              <div>
                <p className="font-medium text-sm">Keep source documents</p>
                <p className="text-xs text-base-content/60">
                  Original uploaded files are retained in active storage.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-base-300 hover:border-primary transition-colors">
              <input
                type="radio"
                className="radio radio-primary mt-0.5"
                checked={finalizeOption === 'ARCHIVE'}
                onChange={() => setFinalizeOption('ARCHIVE')}
              />
              <div>
                <p className="font-medium text-sm">Archive source documents</p>
                <p className="text-xs text-base-content/60">
                  Original files are moved to archive storage (lower cost).
                  Compiled PDFs remain accessible.
                </p>
              </div>
            </label>
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button
            color="ghost"
            onClick={() => setShowFinalizeModal(false)}
            disabled={finalizing}
          >
            Cancel
          </Button>
          <Button
            color="warning"
            onClick={handleFinalize}
            disabled={finalizing}
            loading={finalizing}
          >
            <LockClosedIcon className="h-4 w-4 mr-1" />
            Finalize &amp; Lock
          </Button>
        </Modal.Actions>
      </Modal.Legacy>
    </div>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  if (!env.teamFeatures.mdr) {
    return { notFound: true };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default MdrProjectDashboard;
