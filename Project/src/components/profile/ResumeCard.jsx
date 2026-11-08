import { useRef, useState } from 'react';
import { FileCheck2, FileText, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import Button from '../ui/Button';
import { ConfirmDialog } from '../ui/Modal';
import { Card, SectionHeading } from '../ui/Primitives';
import { useAction } from '../../hooks/useAction';
import { useCandidateStore } from '../../store/candidateStore';
import { toast } from '../../store/toastStore';
import { validateFile } from '../../utils/validators';
import { formatDate, formatFileSize } from '../../utils/format';
import { MAX_RESUME_BYTES, RESUME_EXTENSIONS } from '../../config/app';

export default function ResumeCard({ resume }) {
  const uploadResume = useCandidateStore((state) => state.uploadResume);
  const removeResume = useCandidateStore((state) => state.removeResume);
  const inputRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [upload, uploading] = useAction(uploadResume, { success: (file) => `${file.name} uploaded.` });
  const [remove, removing] = useAction(removeResume, { success: 'Resume removed.' });

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // Lets the same file be selected again.
    if (!file) return;
    const error = validateFile(file, { extensions: RESUME_EXTENSIONS, maxBytes: MAX_RESUME_BYTES });
    if (error) toast.error(error);
    else upload(file);
  };

  return (
    <Card>
      <SectionHeading title="Resume" icon={FileText} description="PDF or Word document, up to 5 MB." />
      <input ref={inputRef} type="file" accept={RESUME_EXTENSIONS.join(',')} onChange={handleFile} className="sr-only" aria-label="Upload resume" tabIndex={-1} />
      {resume ? (
        <>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <FileCheck2 className="size-7 shrink-0 text-brand-600" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{resume.fileName}</p>
              <p className="text-xs text-slate-500">{formatFileSize(resume.fileSize)} · Uploaded {formatDate(resume.uploadedAt)}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" icon={RefreshCw} loading={uploading} onClick={() => inputRef.current?.click()}>Replace</Button>
            <Button variant="danger-ghost" size="sm" icon={Trash2} onClick={() => setConfirmOpen(true)}>Remove</Button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/50"
        >
          <UploadCloud className="mb-2 size-7 text-slate-400" aria-hidden="true" />
          <span className="text-sm font-semibold text-brand-600">{uploading ? 'Uploading…' : 'Click to choose a file'}</span>
          <span className="mt-0.5 text-xs text-slate-500">PDF, DOC or DOCX up to 5 MB</span>
        </button>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove your resume?"
        description="Applications you already submitted keep the copy they were sent with."
        confirmLabel="Remove"
        loading={removing}
        onConfirm={async () => {
          await remove();
          setConfirmOpen(false);
        }}
      />
    </Card>
  );
}
