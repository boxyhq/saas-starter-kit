import React, { useRef } from 'react';
import { createUploadClient } from 'pushduck/client';
import type { AppUploadRouter } from '../pages/api/upload/index';

const upload = createUploadClient<AppUploadRouter>({
  endpoint: '/api/upload',
});

export function ImageUpload() {
  const { uploadFiles, files, isUploading, reset } = upload.imageUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) uploadFiles(selected);
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleChange}
          disabled={isUploading}
        />
        {isUploading ? (
          <p className="text-base-content/60">Uploading...</p>
        ) : (
          <p className="text-base-content/60">
            Click to select images (JPEG, PNG, GIF, WebP &mdash; max 4MB each)
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                {file.status === 'uploading' && (
                  <div className="w-full bg-base-300 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
                {file.status === 'success' && file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline break-all"
                  >
                    {file.url}
                  </a>
                )}
                {file.status === 'error' && (
                  <p className="text-xs text-error">
                    {file.error ?? 'Upload failed'}
                  </p>
                )}
              </div>
              <span
                className={`badge badge-sm ${
                  file.status === 'success'
                    ? 'badge-success'
                    : file.status === 'error'
                      ? 'badge-error'
                      : 'badge-ghost'
                }`}
              >
                {file.status === 'uploading'
                  ? `${file.progress}%`
                  : file.status}
              </span>
            </div>
          ))}
          <button className="btn btn-sm btn-ghost" onClick={reset}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

export function DocumentUpload() {
  const { uploadFiles, files, isUploading, reset } = upload.documentUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) uploadFiles(selected);
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          disabled={isUploading}
        />
        {isUploading ? (
          <p className="text-base-content/60">Uploading...</p>
        ) : (
          <p className="text-base-content/60">
            Click to select files (any type &mdash; max 16MB each)
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                {file.status === 'uploading' && (
                  <div className="w-full bg-base-300 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
                {file.status === 'success' && file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {file.url}
                  </a>
                )}
                {file.status === 'error' && (
                  <p className="text-xs text-error">
                    {file.error ?? 'Upload failed'}
                  </p>
                )}
              </div>
              <span
                className={`badge badge-sm ${
                  file.status === 'success'
                    ? 'badge-success'
                    : file.status === 'error'
                      ? 'badge-error'
                      : 'badge-ghost'
                }`}
              >
                {file.status === 'uploading'
                  ? `${file.progress}%`
                  : file.status}
              </span>
            </div>
          ))}
          <button className="btn btn-sm btn-ghost" onClick={reset}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
