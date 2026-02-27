import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error as ErrorPanel, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import { Button, Modal, Select } from 'react-daisyui';
import {
  PlusIcon,
  EnvelopeIcon,
  PaperClipIcon,
  ArrowRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip file extension and convert separators to spaces → suggested title. */
function suggestTitle(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '')       // remove extension
    .replace(/[-_]+/g, ' ')         // hyphens/underscores → spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Extract a candidate doc number from a filename.
 * Matches common MDR patterns like PROJ-CV-001, ABC-ST-0042, etc.
 */
function suggestDocNumber(filename: string): string {
  const noExt = filename.replace(/\.[^/.]+$/, '');
  // Pattern: two+ letter group, hyphen, two+ letter group, hyphen, digits
  const match = noExt.match(/\b([A-Z]{2,8}-[A-Z]{2,6}-\d{2,6})\b/);
  return match ? match[1] : '';
}

/**
 * Heuristically suggest a section id from filename + email subject.
 * Returns the first section whose title contains any keyword from the filename.
 */
function suggestSectionId(
  filename: string,
  subject: string | null | undefined,
  sections: any[]
): string {
  const needle = `${filename} ${subject ?? ''}`.toLowerCase();
  for (const section of sections) {
    const words = section.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    if (words.some((w) => needle.includes(w))) {
      return section.id;
    }
  }
  return '';
}

// ── Page ──────────────────────────────────────────────────────────────────────

const MdrInboxPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();

  const [selectedInboxId, setSelectedInboxId] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routingAttach, setRoutingAttach] = useState<{
    id: string;
    filename: string;
  } | null>(null);
  const [targetSectionId, setTargetSectionId] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docDiscipline, setDocDiscipline] = useState('');
  const [docRevision, setDocRevision] = useState('');
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

  const { data: emailsData, mutate: mutateEmails } = useSWR(
    team?.slug && mdrId && selectedInboxId
      ? `/api/teams/${team.slug}/mdr/${mdrId}/inbox/${selectedInboxId}/emails`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: sectionsData } = useSWR(
    team?.slug && mdrId
      ? `/api/teams/${team.slug}/mdr/${mdrId}/sections`
      : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPanel message={isError.message} />;
  if (!team) return <ErrorPanel message={t('team-not-found')} />;

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
      if (!res.ok)
        throw new Error(json.error?.message || 'Failed to create inbox');
      toast.success(`Inbox created: ${json.data.emailAddress}`);
      mutateInboxes();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingInbox(false);
    }
  };

  const openRouteModal = (attachId: string, filename: string) => {
    const suggestedSection = suggestSectionId(
      filename,
      selectedEmail?.subject,
      sections
    );
    setRoutingAttach({ id: attachId, filename });
    setDocTitle(suggestTitle(filename));
    setDocNumber(suggestDocNumber(filename));
    setDocDiscipline('');
    setDocRevision('');
    setTargetSectionId(suggestedSection);
    setShowRoute(true);
  };

  const handleRoute = async () => {
    if (!routingAttach || !targetSectionId || !docTitle) return;
    setRouting(true);
    try {
      const res = await fetch(
        `/api/teams/${team.slug}/mdr/${mdrId}/inbox/${selectedInboxId}/emails/${selectedEmailId}/attachments/${routingAttach.id}/route`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionId: targetSectionId,
            title: docTitle,
            docNumber,
            discipline: docDiscipline || undefined,
            revision: docRevision || undefined,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to route');

      const created = json.data;
      toast.success(
        <span>
          Routed as{' '}
          <Link
            href={`/teams/${team.slug}/mdr/${mdrId}/documents`}
            className="underline font-medium"
          >
            {created.docNumber}
          </Link>
        </span>
      );
      setShowRoute(false);
      // Refresh the email list so the attachment shows "Routed" immediately
      mutateEmails();
      mutateInboxes();
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
            Receive documents by email. Route attachments directly into MDR
            sections.
          </p>
        </div>
        <Button
          color="primary"
          size="sm"
          onClick={handleCreateInbox}
          disabled={creatingInbox}
          loading={creatingInbox}
        >
          <PlusIcon className="h-4 w-4 mr-1" /> Create Inbox
        </Button>
      </div>

      {inboxes.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 text-center py-16">
          <EnvelopeIcon className="h-12 w-12 mx-auto text-base-content/30 mb-4" />
          <p className="text-base-content/60">
            No inboxes yet. Create one to receive documents by email.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inbox list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-base-content/60 uppercase tracking-wide">
              Inboxes
            </h3>
            {inboxes.map((inbox: any) => (
              <button
                key={inbox.id}
                onClick={() => {
                  setSelectedInboxId(inbox.id);
                  setSelectedEmailId(null);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedInboxId === inbox.id
                    ? 'border-primary bg-primary/5'
                    : 'border-base-300 hover:border-base-400'
                }`}
              >
                <p className="font-mono text-xs font-medium break-all">
                  {inbox.emailAddress}
                </p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  {inbox._count?.emails ?? 0} emails
                </p>
              </button>
            ))}
          </div>

          {/* Email list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-base-content/60 uppercase tracking-wide">
              Emails
            </h3>
            {!selectedInboxId ? (
              <p className="text-sm text-base-content/40 italic">
                Select an inbox
              </p>
            ) : emails.length === 0 ? (
              <p className="text-sm text-base-content/40 italic">
                No emails yet
              </p>
            ) : (
              emails.map((email: any) => {
                const unrouted = email.attachments?.filter(
                  (a: any) => !a.routedAt
                ).length ?? 0;
                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmailId(email.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedEmailId === email.id
                        ? 'border-primary bg-primary/5'
                        : 'border-base-300 hover:border-base-400'
                    }`}
                  >
                    <p className="text-sm font-medium truncate">
                      {email.subject || '(no subject)'}
                    </p>
                    <p className="text-xs text-base-content/50">
                      {email.fromEmail}
                    </p>
                    <p className="text-xs text-base-content/40 flex items-center gap-2">
                      <span>
                        {new Date(email.receivedAt).toLocaleDateString()}
                      </span>
                      <span>·</span>
                      <span>
                        {email.attachments?.length ?? 0} attachment(s)
                      </span>
                      {unrouted > 0 && (
                        <span className="badge badge-xs badge-warning">
                          {unrouted} unrouted
                        </span>
                      )}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Attachments panel */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-base-content/60 uppercase tracking-wide">
              Attachments
            </h3>
            {!selectedEmail ? (
              <p className="text-sm text-base-content/40 italic">
                Select an email
              </p>
            ) : selectedEmail.attachments?.length === 0 ? (
              <p className="text-sm text-base-content/40 italic">
                No attachments
              </p>
            ) : (
              selectedEmail.attachments?.map((att: any) => (
                <div
                  key={att.id}
                  className="p-3 border border-base-300 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <PaperClipIcon className="h-4 w-4 mt-0.5 shrink-0 text-base-content/50" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {att.filename}
                        </p>
                        <p className="text-xs text-base-content/50">
                          {(Number(att.fileSize) / 1024).toFixed(0)} KB
                        </p>

                        {/* Routed indicator with link to document */}
                        {att.routedAt && att.mdrDocument && (
                          <Link
                            href={`/teams/${team.slug}/mdr/${mdrId}/documents`}
                            className="inline-flex items-center gap-1 text-xs text-success hover:underline mt-0.5"
                          >
                            <DocumentTextIcon className="h-3 w-3" />
                            {att.mdrDocument.docNumber} — {att.mdrDocument.title}
                          </Link>
                        )}
                        {att.routedAt && !att.mdrDocument && (
                          <span className="text-xs text-success">
                            ✓ Routed
                          </span>
                        )}
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
      <Modal.Legacy open={showRoute} onClickBackdrop={() => !routing && setShowRoute(false)}>
        <Modal.Header className="font-bold">Route Attachment to Section</Modal.Header>
        <Modal.Body className="space-y-4">
          {routingAttach && (
            <p className="text-sm text-base-content/60 font-mono truncate">
              {routingAttach.filename}
            </p>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Target Section *</span>
            </label>
            <Select
              value={targetSectionId}
              onChange={(e) => setTargetSectionId(e.target.value)}
            >
              <Select.Option value="">Select section…</Select.Option>
              {sections.map((s: any) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.title}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Document Title *</span>
            </label>
            <input
              className="input input-bordered"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Document Number</span>
              </label>
              <input
                className="input input-bordered"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. PROJ-CV-001"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Revision</span>
              </label>
              <input
                className="input input-bordered"
                value={docRevision}
                onChange={(e) => setDocRevision(e.target.value)}
                placeholder="e.g. A, 0, P1"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Discipline</span>
            </label>
            <input
              className="input input-bordered"
              value={docDiscipline}
              onChange={(e) => setDocDiscipline(e.target.value)}
              placeholder="e.g. Civil, Structural, MEP"
            />
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button
            color="ghost"
            onClick={() => setShowRoute(false)}
            disabled={routing}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleRoute}
            disabled={routing || !targetSectionId || !docTitle}
            loading={routing}
          >
            Route Document
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

export default MdrInboxPage;
