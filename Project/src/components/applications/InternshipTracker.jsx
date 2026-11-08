import { CheckCircle2, MessageSquareText } from 'lucide-react';
import Button from '../ui/Button';
import { Field } from '../ui/Form';
import { ProgressBar } from '../ui/Primitives';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { useApplicationStore } from '../../store/applicationStore';
import { numberRange, required } from '../../utils/validators';
import { formatDate } from '../../utils/format';

// What both sides see: progress, mentor feedback and the completion record.
export function InternshipProgress({ record }) {
  if (!record) {
    return <p className="text-sm text-slate-500">Progress updates and mentor feedback will appear here once the internship begins.</p>;
  }
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{record.completedAt ? 'Completed' : 'In progress'}</span>
        <span className="font-semibold text-slate-900">{record.progress}%</span>
      </div>
      <ProgressBar value={record.progress} tone={record.completedAt ? 'success' : 'brand'} label="Internship progress" />
      {record.completedAt && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-sm text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          Completion recorded on {formatDate(record.completedAt)}
        </p>
      )}
      {record.updates.length > 0 && (
        <ul className="mt-4 space-y-3">
          {record.updates.map((update) => (
            <li key={update.id} className="flex gap-2.5 text-sm">
              <MessageSquareText className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-slate-700">{update.note}</p>
                <p className="text-xs text-slate-500">{update.mentorName ? `${update.mentorName} · ` : ''}{formatDate(update.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Recruiter controls for a selected intern.
export function InternshipUpdateForm({ application }) {
  const updateInternship = useApplicationStore((state) => state.updateInternship);
  const record = application.internshipRecord;
  const form = useForm(
    { progress: record?.progress ?? 0, mentorName: record?.updates.at(-1)?.mentorName ?? '', note: '' },
    { progress: [required('Progress'), numberRange(0, 100, 'Progress')], note: [required('Feedback')] },
  );
  const [save, saving] = useAction(
    (complete) => updateInternship(application.id, {
      progress: complete ? 100 : Number(form.values.progress),
      mentorName: form.values.mentorName.trim(),
      note: form.values.note.trim(),
      complete,
    }),
    { success: (complete) => (complete ? 'Internship completed. It now appears on the candidate\'s profile.' : 'Progress update saved.') },
  );

  if (record?.completedAt) return null;

  const submit = async (complete) => {
    if (form.validate() && (await save(complete))) form.setValue('note', '');
  };

  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field form={form} name="progress" type="number" min="0" max="100" label="Progress (%)" required />
        <Field form={form} name="mentorName" label="Mentor name" />
      </div>
      <Field form={form} as="textarea" rows={2} name="note" label="Mentor feedback or milestone" required />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" loading={saving} onClick={() => submit(false)}>Save update</Button>
        <Button size="sm" icon={CheckCircle2} loading={saving} onClick={() => submit(true)}>Mark as completed</Button>
      </div>
    </div>
  );
}
