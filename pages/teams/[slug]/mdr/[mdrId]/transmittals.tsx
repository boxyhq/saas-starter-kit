import useSWR from 'swr';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import { Error as ErrorPanel, Loading } from '@/components/shared';
import MdrNavTabs from '@/components/mdr/MdrNavTabs';
import { Button, Modal, Input, Select, Textarea, Badge } from 'react-daisyui';
import { PlusIcon, PaperAirplaneIcon, ArrowDownTrayIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const purposeLabels: Record<string, string> = {
  IFC: 'IFC – Issued for Construction',
  IFA: 'IFA – Issued for Approval',
  IFI: 'IFI – Issued for Information',
  FOR_REVIEW: 'For Review',
  FOR_APPROVAL: 'For Approval',
  FOR_INFORMATION: 'For Information',
};

const statusBadge = (status: string) =>
  status === 'ISSUED' ? 'badge-success' : 'badge-warning';

const MdrTransmittalsPage = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mdrId } = router.query as { mdrId: string };
  const { isLoading, isError, team } = useTeam();
  const [showCreate, setShowCreate] = useState(false);
  const [issuing, setIssuing] = useState<string | null>(null);
  const [downloadingCover, setDownloadingCover] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const { data: projectData } = useSWR(
    team?.slug && mdrId ? `/api/teams/${team.slug}/mdr/${mdrId}` : null,
    fetcher
  );

  const { data: transmittalsData, mutate } = useSWR(
    team?.slug && mdrId
      ? `/api/teams/${team.slug}/mdr/${mdrId}/transmittals`
      : null,
    fetcher
  );

  const formik = useFormik({
    initialValues: {
      transmittalNumber: '',
      purpose: 'FOR_INFORMATION',
      toName: '',
      toEmail: '',
      fromName: '',
      notes: '',
    },
    validationSchema: Yup.object({
      transmittalNumber: Yup.string().required('Required'),
      purpose: Yup.string().required('Required'),
      toEmail: Yup.string().email('Invalid email').optional(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const res = await fetch(
        `/api/teams/${team!.slug}/mdr/${mdrId}/transmittals`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || 'Failed to create transmittal');
        return;
      }
      toast.success('Transmittal created');
      resetForm();
      setShowCreate(false);
      mutate();
    },
  });

  const handleIssue = async (transmittalId: string) => {
    setIssuing(transmittalId);
    try {
      const res = await fetch(
        `/api/teams/${team!.slug}/mdr/${mdrId}/transmittals/${transmittalId}/issue`,
        { method: 'POST' }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to issue');
      toast.success('Transmittal issued!');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIssuing(null);
    }
  };

  const handleDownloadCoverSheet = async (transmittalId: string) => {
    setDownloadingCover(transmittalId);
    try {
      const res = await fetch(
        `/api/teams/${team!.slug}/mdr/${mdrId}/transmittals/${transmittalId}/cover-sheet`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to get download URL');
      window.open(json.data.url, '_blank');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDownloadingCover(null);
    }
  };

  const handleSendEmail = async (transmittalId: string) => {
    setSendingEmail(transmittalId);
    try {
      const res = await fetch(
        `/api/teams/${team!.slug}/mdr/${mdrId}/transmittals/${transmittalId}/send-email`,
        { method: 'POST' }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to send email');
      toast.success('Email sent to recipient!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSendingEmail(null);
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPanel message={isError.message} />;
  if (!team) return <ErrorPanel message={t('team-not-found')} />;

  const project = projectData?.data;
  const transmittals = transmittalsData?.data ?? [];

  return (
    <div className="space-y-6">
      <MdrNavTabs
        activeTab="transmittals"
        teamSlug={team.slug}
        mdrId={mdrId}
        projectName={project?.name}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('mdr-transmittals')}</h2>
          <p className="text-sm text-base-content/60">
            Formal document issue packages (IFC, IFA, IFI) with numbered cover sheets.
          </p>
        </div>
        <Button color="primary" size="sm" onClick={() => setShowCreate(true)}>
          <PlusIcon className="h-4 w-4 mr-1" /> New Transmittal
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Number</th>
              <th>Purpose</th>
              <th>To</th>
              <th>Status</th>
              <th>Issued</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transmittals.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-base-content/50 py-8">
                  No transmittals yet. Create your first one above.
                </td>
              </tr>
            ) : (
              transmittals.map((tr: any) => (
                <tr key={tr.id}>
                  <td className="font-mono font-semibold">{tr.transmittalNumber}</td>
                  <td className="text-sm">{purposeLabels[tr.purpose] ?? tr.purpose}</td>
                  <td className="text-sm">{tr.toName || tr.toEmail || '—'}</td>
                  <td>
                    <span className={`badge badge-sm ${statusBadge(tr.status)}`}>
                      {tr.status}
                    </span>
                  </td>
                  <td className="text-sm">
                    {tr.issuedAt ? new Date(tr.issuedAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    {tr.status === 'DRAFT' && (
                      <Button
                        size="xs"
                        color="primary"
                        onClick={() => handleIssue(tr.id)}
                        disabled={issuing === tr.id}
                        loading={issuing === tr.id}
                      >
                        <PaperAirplaneIcon className="h-3 w-3 mr-1" />
                        Issue
                      </Button>
                    )}
                    {tr.status === 'ISSUED' && tr.coverSheetS3Key && (
                      <div className="flex gap-1">
                        <Button
                          size="xs"
                          color="ghost"
                          onClick={() => handleDownloadCoverSheet(tr.id)}
                          disabled={downloadingCover === tr.id}
                          loading={downloadingCover === tr.id}
                        >
                          <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                          Cover Sheet
                        </Button>
                        {tr.toEmail && (
                          <Button
                            size="xs"
                            color="ghost"
                            onClick={() => handleSendEmail(tr.id)}
                            disabled={sendingEmail === tr.id}
                            loading={sendingEmail === tr.id}
                            title={`Send to ${tr.toEmail}`}
                          >
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            Send
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create transmittal modal */}
      <Modal.Legacy open={showCreate} onClickBackdrop={() => setShowCreate(false)}>
        <Modal.Header className="font-bold">New Transmittal</Modal.Header>
        <Modal.Body>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Transmittal Number *</span></label>
              <Input
                name="transmittalNumber"
                value={formik.values.transmittalNumber}
                onChange={formik.handleChange}
                placeholder="e.g. TR-001"
                className={formik.errors.transmittalNumber ? 'input-error' : ''}
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Purpose *</span></label>
              <Select
                name="purpose"
                value={formik.values.purpose}
                onChange={formik.handleChange}
              >
                {Object.entries(purposeLabels).map(([k, v]) => (
                  <Select.Option key={k} value={k}>{v}</Select.Option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">To (Name)</span></label>
                <Input name="toName" value={formik.values.toName} onChange={formik.handleChange} placeholder="Client name" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">To (Email)</span></label>
                <Input name="toEmail" value={formik.values.toEmail} onChange={formik.handleChange} placeholder="client@example.com" />
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">From (Name)</span></label>
              <Input name="fromName" value={formik.values.fromName} onChange={formik.handleChange} placeholder="Your name" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Notes</span></label>
              <Textarea name="notes" value={formik.values.notes} onChange={formik.handleChange} placeholder="Additional notes…" rows={3} />
            </div>
          </form>
        </Modal.Body>
        <Modal.Actions>
          <Button color="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button
            color="primary"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            loading={formik.isSubmitting}
          >
            Create
          </Button>
        </Modal.Actions>
      </Modal.Legacy>
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

export default MdrTransmittalsPage;
