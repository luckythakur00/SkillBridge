import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, FileCheck2 } from 'lucide-react';
import { MatchBadge } from './OpportunityCard';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Field } from '../ui/Form';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { useApplicationStore } from '../../store/applicationStore';
import { useCandidateStore } from '../../store/candidateStore';

const MAX_NOTE = 1000;

export default function ApplyModal({ open, onClose, opportunity }) {
  const profile = useCandidateStore((state) => state.profile);
  const fetchProfile = useCandidateStore((state) => state.fetchProfile);
  const apply = useApplicationStore((state) => state.apply);
  const form = useForm({ coverNote: '' }, {
    coverNote: [(value) => (value.length > MAX_NOTE ? `Keep your note under ${MAX_NOTE} characters.` : '')],
  });
  const [submit, pending] = useAction(
    () => apply({ opportunityId: opportunity.id, coverNote: form.values.coverNote.trim() }),
    { success: `Application sent to ${opportunity.organization?.name}.` },
  );

  useEffect(() => {
    if (open && !profile) fetchProfile();
  }, [open, profile, fetchProfile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.validate() && (await submit())) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Apply: ${opportunity.title}`}
      description={opportunity.organization?.name}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="apply-form" loading={pending}>Submit application</Button>
        </>
      }
    >
      <form id="apply-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm">
          <span className="font-medium text-slate-700">Your skill match</span>
          <MatchBadge score={opportunity.matchScore ?? 0} />
        </div>

        {profile?.resume ? (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <FileCheck2 className="size-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{profile.resume.fileName}</p>
              <p className="text-xs text-slate-500">This resume will be shared with the recruiter.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              You have not uploaded a resume. You can still apply, but{' '}
              <Link to="/candidate/profile" className="font-semibold underline">adding one</Link> improves your chances.
            </p>
          </div>
        )}

        <Field
          form={form}
          as="textarea"
          name="coverNote"
          label="Note to the recruiter (optional)"
          placeholder="Share why you are a good fit for this role."
          hint={`${form.values.coverNote.length}/${MAX_NOTE} characters`}
        />
      </form>
    </Modal>
  );
}
