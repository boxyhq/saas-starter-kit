import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Button, Input } from 'react-daisyui';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface MdrDocumentUploaderProps {
  teamSlug: string;
  mdrId: string;
  sectionId: string;
  onUploaded: () => void;
}

const MdrDocumentUploader = ({
  teamSlug,
  mdrId,
  sectionId,
  onUploaded,
}: MdrDocumentUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [revision, setRevision] = useState('0');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const computeSha256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleUpload = async () => {
    if (!file || !title.trim() || !docNumber.trim()) {
      toast.error('File, title and document number are required');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Compute SHA-256 for deduplication
      const sha256Hash = await computeSha256(file);

      // Request presigned URL
      const urlRes = await fetch(
        `/api/teams/${teamSlug}/mdr/${mdrId}/upload-url`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sha256Hash,
            mimeType: file.type || 'application/octet-stream',
            filename: file.name,
            sectionId,
          }),
        }
      );

      const urlJson = await urlRes.json();

      if (!urlRes.ok) {
        toast.error(urlJson.error?.message || 'Failed to get upload URL');
        return;
      }

      // Deduplication check
      if (urlJson.data?.duplicate) {
        const dup = urlJson.data.duplicate;
        if (
          confirm(
            `This file already exists as "${dup.docNumber} — ${dup.title}"${dup.sectionName ? ` in section "${dup.sectionName}"` : ''}. Link to the existing file instead?`
          )
        ) {
          // Link existing document
          const linkRes = await fetch(
            `/api/teams/${teamSlug}/mdr/${mdrId}/sections/${sectionId}/documents`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ existingDocumentId: dup.id }),
            }
          );
          if (!linkRes.ok) {
            const json = await linkRes.json();
            toast.error(json.error?.message || 'Failed to link document');
            return;
          }
          toast.success('Document linked successfully!');
          reset();
          onUploaded();
          return;
        }
        return;
      }

      const { uploadUrl, s3Key } = urlJson.data;

      // Upload directly to S3 via XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`S3 upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('S3 upload network error'));
        xhr.send(file);
      });

      setProgress(100);

      // Create document record
      const docRes = await fetch(
        `/api/teams/${teamSlug}/mdr/${mdrId}/sections/${sectionId}/documents`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            s3Key,
            sha256Hash,
            title: title.trim(),
            docNumber: docNumber.trim(),
            revision: revision.trim() || '0',
            fileSize: file.size,
            mimeType: file.type || 'application/octet-stream',
            originalName: file.name,
          }),
        }
      );

      const docJson = await docRes.json();
      if (!docRes.ok) {
        toast.error(docJson.error?.message || 'Failed to save document record');
        return;
      }

      toast.success('Document uploaded!');
      reset();
      onUploaded();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setFile(null);
    setTitle('');
    setDocNumber('');
    setRevision('0');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="border border-base-200 rounded-lg p-4 space-y-3">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <CloudArrowUpIcon className="h-4 w-4" />
        Upload Document
      </h3>

      <div>
        <input
          ref={fileRef}
          type="file"
          className="file-input file-input-bordered file-input-sm w-full"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ''));
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label label-text text-xs">Title *</label>
          <Input
            size="xs"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            className="w-full"
          />
        </div>
        <div>
          <label className="label label-text text-xs">Document Number *</label>
          <Input
            size="xs"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder="e.g. P-DRW-001"
            className="w-full"
          />
        </div>
        <div>
          <label className="label label-text text-xs">Revision</label>
          <Input
            size="xs"
            value={revision}
            onChange={(e) => setRevision(e.target.value)}
            placeholder="e.g. A, 0, 1"
            className="w-full"
          />
        </div>
      </div>

      {uploading && progress > 0 && (
        <div className="w-full bg-base-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          color="primary"
          loading={uploading}
          disabled={!file || !title.trim() || !docNumber.trim() || uploading}
          onClick={handleUpload}
        >
          Upload
        </Button>
        {file && (
          <Button size="sm" color="ghost" onClick={reset}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default MdrDocumentUploader;
