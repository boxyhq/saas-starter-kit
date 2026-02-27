import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  docId: string;
  mdrId: string;
  teamSlug: string;
  filename: string;
  onClose: () => void;
}

const MdrDocumentPreview: React.FC<Props> = ({ docId, mdrId, teamSlug, filename, onClose }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/teams/${teamSlug}/mdr/${mdrId}/documents/${docId}/preview-url`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error.message);
        setUrl(json.data.url);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [docId, mdrId, teamSlug]);

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl h-[85vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 flex-shrink-0">
          <span className="font-medium text-sm truncate max-w-md">{filename}</span>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-error mb-2">{error}</p>
                <p className="text-sm text-base-content/50">
                  PDF preview is generated after upload. Try again shortly.
                </p>
              </div>
            </div>
          )}
          {url && !loading && (
            <iframe
              src={url}
              className="w-full h-full"
              title={`Preview: ${filename}`}
            />
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
};

export default MdrDocumentPreview;
