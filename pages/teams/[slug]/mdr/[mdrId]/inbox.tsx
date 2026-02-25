import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import { Button, Modal, Select } from 'react-daisyui';
import { PlusIcon, EnvelopeIcon, PaperClipIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const MdrInboxPage = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();

  const [selectedInboxId, setSelectedInboxId] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routingAttachId, setRoutingAttachId] = useState<string | null>(null);
  const [targetSectionId, setTargetSectionId] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [routing, setRouting] = useState(false);
  const [creatingInbox, setCreatingInbox] = useState(false);

  const { data: projectData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}` : null,
    fetcher
  );

  const { data: inboxesData, mutate: mutateInboxes } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}/inbox` : null,
    fetcher
  );

  const { data: emailsData } = useSWR(
    team?.slug && mdrId && selectedInboxId
      ? `/api/teams/${team.slug}/mdr/${mdrId}/inbox/${selectedInboxId}/emails`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: sectionsData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}/sections` : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!team) return <Error message={t('team-not-found')} />;

  const project = projectData?.data;
  const inboxes = inboxesData?.data ?? [];
  const emails = emailsData?.data ?? [];
  const sections = sectionsData?.data ?? [];
  const selectedEmail = emails.find((e: any) => e.id === selectedEmailId);

  const handleCreateInbox = async () => {
    setCreatingInbox(true);
    try {
      const res = await fetch(`/api/teams/${team.slug}/mdr/${mdrId}/inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create inbox');
      toast.success(`Inbox created: ${json.data.emailAddress}`);
      mutateInboxes();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingInbox(false);
    }
  };

  const openRouteModal = (attachId: string, filename: string) => {
    setRoutingAttachId(attachId);
    setDocTitle(filename.replace(/\.[^/.]+$/, ''));
    setTargetSectionId('');
    setDocNumber('');
    setShowRoute(true);
  };

  const handleRoute = async () => {
    if (!routingAttachId || !targetSectionId) return;
    setRouting(true);
    try {
      const res = await fetch(
        `/api/teams/${team.slug}/mdr/${mdrId}/inbox/${selectedInboxId}/emails/${selectedEmailId}/attachments/${routingAttachId}/route`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionId: targetSectionId, title: docTitle, docNumber }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to route');
      toast.success('Attachment routed as document!');
      setShowRoute(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRouting(false);
    }
  };

  return (
    <div className="space-y-6">
      <MdrNavTabs
        activeTab="inbox"
        teamSlug={team.slug}
        mdrId={mdrId}
        projectName={project?.name}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('mdr-inbox')}</h2>
          <p className="text-sm text-base-content/60">
            Receive documents by email. Route attachments directly into MDR sections.
          </p>
        </div>
        <Button color="primary" size="sm" onClick={handleCreateInbox} disabled={creatingInbox} loading={creatingInbox}>
          <PlusIcon className="h-4 w-4 mr-1" /> Create Inbox
        </Button>
      </div>

      {inboxes.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 text-center py-16">
          <EnvelopeIcon className="h-12 w-12 mx-auto text-base-content/30 mb-4" />
          <p className="text-base-content/60">No inboxes yet. Create one to receive documents by email.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inbox list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-base-content/60 uppercase tracking-wide">Inboxes</h3>
            {inboxes.map((inbox: any) => (
              <button
                key={inbox.id}
                onClick={() => { setSelectedInboxId(inbox.id); setSelectedEmailId(null); }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedInboxId === inbox.id ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-base-400'}`}
              >
                <p className="font-mono text-xs font-medium break-all">{inbox.emailAddress}</p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  {inbox._count?.emails ?? 0} emails
                </p>
              </button>
            ))}
          </div>

          {/* Email list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-base-content/60 uppercase tracking-wide">Emails</h3>
            {!selectedInboxId ? (
              <p className="text-sm text-base-content/40 italic">Select an inbox</p>
            ) : emails.length === 0 ? (
              <p className="text-sm text-base-content/40 italic">No emails yet</p>
            ) : (
              emails.map((email: any) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedEmailId === email.id ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-base-400'}`}
                >
                  <p className="text-sm font-medium truncate">{email.subject || '(no subject)'}</p>
                  <p className="text-xs text-base-content/50">{email.fromEmail}</p>
                  <p className="text-xs text-base-content/40">
                    {new Date(email.receivedAt).toLocaleDateString()} · {email.attachments?.length ?? 0} attachment(s)
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-base-content/60 uppercase tracking-wide">Attachments</h3>
            {!selectedEmail ? (
              <p className="text-sm text-base-content/40 italic">Select an email</p>
            ) : selectedEmail.attachments?.length === 0 ? (
              <p className="text-sm text-base-content/40 italic">No attachments</p>
            ) : (
              selectedEmail.attachments?.map((att: any) => (
                <div key={att.id} className="p-3 border border-base-300 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <PaperClipIcon className="h-4 w-4 mt-0.5 shrink-0 text-base-content/50" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{att.filename}</p>
                        <p className="text-xs text-base-content/50">
                          {(att.fileSize / 1024).toFixed(0)} KB
                          {att.routedAt && <span className="ml-2 text-success">✓ Routed</span>}
                        </p>
                      </div>
                    </div>
                    {!att.routedAt && (
                      <Button
                        size="xs"
                        color="primary"
                        onClick={() => openRouteModal(att.id, att.filename)}
                      >
                        <ArrowRightIcon className="h-3 w-3 mr-1" />
                        Route
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Route attachment modal */}
      <Modal open={showRoute} onClickBackdrop={() => setShowRoute(false)}>
        <Modal.Header className="font-bold">Route Attachment to Section</Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Target Section *</span></label>
            <Select value={targetSectionId} onChange={(e) => setTargetSectionId(e.target.value)}>
              <Select.Option value="">Select section…</Select.Option>
              {sections.map((s: any) => (
                <Select.Option key={s.id} value={s.id}>{s.title}</Select.Option>
              ))}
            </Select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Document Title *</span></label>
            <input
              className="input input-bordered"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document title"
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Document Number</span></label>
            <input
              className="input input-bordered"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder="e.g. PROJ-CV-001"
            />
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button color="ghost" onClick={() => setShowRoute(false)}>Cancel</Button>
          <Button
            color="primary"
            onClick={handleRoute}
            disabled={routing || !targetSectionId || !docTitle}
            loading={routing}
          >
            Route Document
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
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

export default MdrInboxPage;
