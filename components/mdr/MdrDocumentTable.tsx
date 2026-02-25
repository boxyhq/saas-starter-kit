import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from 'react-daisyui';
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

interface MdrDocument {
  id: string;
  docNumber: string;
  title: string;
  discipline?: string | null;
  revision?: string | null;
  status: string;
  mimeType: string;
  fileSize: string;
  uploadedAt: string;
  s3Key: string;
  pdfS3Key?: string | null;
}

interface MdrDocumentTableProps {
  documents: MdrDocument[];
  teamSlug: string;
  mdrId: string;
  onUpdate: () => void;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: 'badge-neutral',
    FOR_REVIEW: 'badge-warning',
    APPROVED: 'badge-success',
    REJECTED: 'badge-error',
    SUPERSEDED: 'badge-ghost',
    VOID: 'badge-ghost',
  };
  return map[status] ?? 'badge-neutral';
};

const MdrDocumentTable = ({
  documents,
  teamSlug,
  mdrId,
  onUpdate,
}: MdrDocumentTableProps) => {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (docId: string, sectionId?: string) => {
    if (!confirm('Remove this document?')) return;
    setDeleting(docId);
    try {
      // If sectionId is provided, just unlink; otherwise delete
      const url = sectionId
        ? `/api/teams/${teamSlug}/mdr/${mdrId}/sections/${sectionId}/documents/${docId}`
        : `/api/teams/${teamSlug}/mdr/${mdrId}/documents/${docId}`;

      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error?.message || 'Failed to remove document');
        return;
      }
      onUpdate();
    } finally {
      setDeleting(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-500">
        No documents in this section yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full text-sm">
        <thead>
          <tr>
            <th>Doc Number</th>
            <th>Title</th>
            <th>Revision</th>
            <th>Status</th>
            <th>Discipline</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="font-mono text-xs">{doc.docNumber}</td>
              <td className="max-w-xs truncate" title={doc.title}>
                {doc.title}
              </td>
              <td>{doc.revision ?? '0'}</td>
              <td>
                <span className={`badge badge-xs ${statusBadge(doc.status)}`}>
                  {doc.status.replace('_', ' ')}
                </span>
              </td>
              <td>{doc.discipline ?? '—'}</td>
              <td className="text-xs text-gray-500">
                {(Number(doc.fileSize) / 1024).toFixed(0)} KB
              </td>
              <td>
                <div className="flex gap-1">
                  <Button
                    size="xs"
                    color="ghost"
                    title="Download"
                    onClick={async () => {
                      // Get presigned URL
                      const res = await fetch(
                        `/api/teams/${teamSlug}/mdr/${mdrId}/documents/${doc.id}/download-url`
                      );
                      if (!res.ok) {
                        toast.error('Failed to get download link');
                        return;
                      }
                      const json = await res.json();
                      window.open(json.data.url, '_blank');
                    }}
                  >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="xs"
                    color="ghost"
                    className="text-error"
                    loading={deleting === doc.id}
                    onClick={() => handleDelete(doc.id)}
                    title="Delete"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MdrDocumentTable;
