import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarPlus, Check, CheckCircle2, ClipboardList, Columns3, FileText, Minus, Star, XCircle } from 'lucide-react';
import { ApplicationTimeline, InterviewCard, StatusBadge } from '../../components/applications/ApplicationParts';
import { InternshipProgress, InternshipUpdateForm } from '../../components/applications/InternshipTracker';
import { MatchBadge } from '../../components/opportunities/OpportunityCard';
import { SkillsByLevel } from '../../components/profile/PortfolioView';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Field, FilterSelect, SearchInput } from '../../components/ui/Form';
import { Avatar, Card, EmptyState, ErrorState, PageHeader, Skeleton, TableShell } from '../../components/ui/Primitives';
import { useApplicationStore } from '../../store/applicationStore';
import { useJobStore } from '../../store/jobStore';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { futureDate, required } from '../../utils/validators';
import { computeMatch } from '../../utils/skillMatch';
import { APPLICATION_STATUS, APPLICATION_TRANSITIONS, INTERVIEW_MODES, SKILL_LEVEL_LABEL, SKILL_LEVEL_RANK } from '../../constants';
import { formatDate, formatFileSize } from '../../utils/format';

const STATUS_OPTIONS = Object.entries(APPLICATION_STATUS).map(([value, meta]) => ({ value, label: meta.label }));
const ACTION_META = {
  UNDER_REVIEW: { label: 'Start review', icon: ClipboardList, variant: 'secondary' },
  SHORTLISTED: { label: 'Shortlist', icon: Star, variant: 'primary' },
  SELECTED: { label: 'Select', icon: CheckCircle2, variant: 'primary' },
  REJECTED: { label: 'Reject', icon: XCircle, variant: 'danger-ghost' },
};
const MAX_COMPARE = 3;

function InterviewModal({ application, onClose }) {
  const scheduleInterview = useApplicationStore((state) => state.scheduleInterview);
  const form = useForm(
    { scheduledAt: '', mode: 'VIDEO', details: application?.interview?.details ?? '' },
    { scheduledAt: [required('Date and time'), futureDate('Date')], mode: [required('Mode')] },
  );
  const [schedule, pending] = useAction(
    () => scheduleInterview(application.id, { ...form.values, scheduledAt: new Date(form.values.scheduledAt).toISOString() }),
    { success: `Interview scheduled. ${application.candidate?.fullName} has been notified.` },
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.validate() && (await schedule())) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Schedule interview"
      description={`${application.candidate?.fullName} · ${application.opportunity?.title}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="interview-form" loading={pending}>Schedule</Button>
        </>
      }
    >
      <form id="interview-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field form={form} name="scheduledAt" type="datetime-local" label="Date and time" required />
        <Field form={form} as="select" name="mode" label="Mode" options={INTERVIEW_MODES} />
        <Field form={form} as="textarea" rows={3} name="details" label="Details for the candidate" placeholder="Meeting link, address or what to prepare." />
      </form>
    </Modal>
  );
}

function ReviewModal({ application, onClose, onSchedule }) {
  const updateStatus = useApplicationStore((state) => state.updateStatus);
  const [setStatus, pending] = useAction(
    (status) => updateStatus(application.id, { status }),
    { success: (status) => `Application moved to ${APPLICATION_STATUS[status].label}. The candidate has been notified.` },
  );
  if (!application) return null;

  const { candidate, opportunity } = application;
  const match = computeMatch(candidate?.skills, opportunity?.requiredSkills);
  const next = APPLICATION_TRANSITIONS[application.status].filter((status) => status !== 'WITHDRAWN');

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={candidate?.fullName ?? 'Candidate'}
      description={`Applied for ${opportunity?.title} on ${formatDate(application.appliedAt)}`}
      footer={
        <>
          <Button variant="secondary" to={`/recruiter/candidates/${application.candidateId}`} className="mr-auto">Full profile</Button>
          {next.includes('REJECTED') && <Button variant="danger-ghost" icon={XCircle} loading={pending} onClick={() => setStatus('REJECTED')}>Reject</Button>}
          {next.filter((status) => !['REJECTED', 'INTERVIEW'].includes(status)).map((status) => {
            const meta = ACTION_META[status];
            return <Button key={status} variant={meta.variant} icon={meta.icon} loading={pending} onClick={() => setStatus(status)}>{meta.label}</Button>;
          })}
          {(next.includes('INTERVIEW') || application.status === 'INTERVIEW') && (
            <Button variant="navy" icon={CalendarPlus} onClick={onSchedule}>{application.interview ? 'Reschedule' : 'Schedule interview'}</Button>
          )}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={application.status} />
            <MatchBadge score={match.score} />
          </div>
          {application.interview && application.status === 'INTERVIEW' && <InterviewCard interview={application.interview} />}
          {candidate?.headline && <p className="text-sm text-slate-600">{candidate.headline}</p>}
          {application.coverNote && (
            <div>
              <h3 className="mb-1 text-sm font-bold">Cover note</h3>
              <p className="text-sm text-slate-600">{application.coverNote}</p>
            </div>
          )}
          <div>
            <h3 className="mb-1.5 text-sm font-bold">Resume</h3>
            {application.resume ? (
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <FileText className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                {application.resume.fileName}
                <span className="text-slate-500">({formatFileSize(application.resume.fileSize)})</span>
              </p>
            ) : <p className="text-sm text-slate-500">No resume was attached.</p>}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold">Candidate skills</h3>
            <SkillsByLevel skills={candidate?.skills ?? []} />
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-bold">Skill compatibility</h3>
            <ul className="space-y-1.5 text-sm">
              {match.matched.map((skill) => <li key={skill.name} className="flex items-center gap-2 text-slate-700"><Check className="size-4 shrink-0 text-emerald-600" aria-label="Met" />{skill.name}</li>)}
              {match.partial.map((skill) => <li key={skill.name} className="flex items-center gap-2 text-slate-700"><Minus className="size-4 shrink-0 text-amber-600" aria-label="Partly met" />{skill.name} ({SKILL_LEVEL_LABEL[skill.currentLevel]}, needs {SKILL_LEVEL_LABEL[skill.level]})</li>)}
              {match.missing.map((skill) => <li key={skill.name} className="flex items-center gap-2 text-slate-500"><XCircle className="size-4 shrink-0 text-slate-400" aria-label="Missing" />{skill.name}</li>)}
            </ul>
          </div>
          {opportunity?.type === 'INTERNSHIP' && application.status === 'SELECTED' && (
            <div>
              <h3 className="mb-3 text-sm font-bold">Internship progress</h3>
              <InternshipProgress record={application.internshipRecord} />
              <InternshipUpdateForm key={application.updatedAt} application={application} />
            </div>
          )}
          <div>
            <h3 className="mb-3 text-sm font-bold">Timeline</h3>
            <ApplicationTimeline application={application} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CompareModal({ applications, onClose }) {
  const required_ = applications[0]?.opportunity?.requiredSkills ?? [];
  const levelOf = (application, name) => application.candidate?.skills.find((skill) => skill.name.toLowerCase() === name.toLowerCase());

  return (
    <Modal open onClose={onClose} size="xl" title="Compare candidates" description={applications[0]?.opportunity?.title} footer={<Button onClick={onClose}>Close</Button>}>
      <TableShell>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="py-2.5 pr-4 text-xs font-medium text-slate-500">Required skill</th>
              {applications.map((application) => (
                <th scope="col" key={application.id} className="px-3 py-2.5">
                  <Link to={`/recruiter/candidates/${application.candidateId}`} className="font-semibold text-slate-900 hover:text-brand-700">{application.candidate?.fullName}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <th scope="row" className="py-2.5 pr-4 font-medium text-slate-700">Overall match</th>
              {applications.map((application) => (
                <td key={application.id} className="px-3 py-2.5"><MatchBadge score={computeMatch(application.candidate?.skills, required_).score} /></td>
              ))}
            </tr>
            {required_.map((requirement) => (
              <tr key={requirement.name}>
                <th scope="row" className="py-2.5 pr-4 font-normal text-slate-700">
                  {requirement.name}
                  <span className="block text-xs text-slate-500">Needs {SKILL_LEVEL_LABEL[requirement.level]}</span>
                </th>
                {applications.map((application) => {
                  const skill = levelOf(application, requirement.name);
                  const met = skill && SKILL_LEVEL_RANK[skill.level] >= SKILL_LEVEL_RANK[requirement.level];
                  return (
                    <td key={application.id} className="px-3 py-2.5">
                      {skill ? (
                        <span className="flex items-center gap-1.5 text-slate-800">
                          {met ? <Check className="size-4 text-emerald-600" aria-label="Met" /> : <Minus className="size-4 text-amber-600" aria-label="Below requirement" />}
                          {SKILL_LEVEL_LABEL[skill.level]}{skill.verified ? ' (verified)' : ''}
                        </span>
                      ) : <span className="text-slate-500">Not listed</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </Modal>
  );
}

export default function ApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const applications = useApplicationStore((state) => state.received);
  const loading = useApplicationStore((state) => state.loading.received);
  const error = useApplicationStore((state) => state.errors.received);
  const fetchReceived = useApplicationStore((state) => state.fetchReceived);
  const postings = useJobStore((state) => state.postings);
  const fetchPostings = useJobStore((state) => state.fetchPostings);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState('recent');
  const [selected, setSelected] = useState([]);
  const [reviewId, setReviewId] = useState(null);
  const [scheduleId, setScheduleId] = useState(null);
  const [comparing, setComparing] = useState(false);

  const posting = searchParams.get('opportunity') ?? 'ALL';

  useEffect(() => {
    fetchReceived();
    fetchPostings();
  }, [fetchReceived, fetchPostings]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    const list = applications.filter((application) => {
      if (posting !== 'ALL' && application.opportunityId !== posting) return false;
      if (status !== 'ALL' && application.status !== status) return false;
      if (!text) return true;
      const skills = application.candidate?.skills ?? [];
      return application.candidate?.fullName.toLowerCase().includes(text) || skills.some((skill) => skill.name.toLowerCase().includes(text));
    });
    return sort === 'match' ? [...list].sort((a, b) => b.matchScore - a.matchScore) : list;
  }, [applications, posting, status, query, sort]);

  const selectedApplications = applications.filter((application) => selected.includes(application.id));
  const samePosting = new Set(selectedApplications.map((application) => application.opportunityId)).size === 1;
  const canCompare = selected.length >= 2 && samePosting;
  const reviewing = applications.find((application) => application.id === reviewId) ?? null;
  const scheduling = applications.find((application) => application.id === scheduleId) ?? null;

  const toggleSelected = (id) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((entry) => entry !== id);
      return current.length < MAX_COMPARE ? [...current, id] : current;
    });
  };

  const setPosting = (value) => {
    setSelected([]);
    setSearchParams(value === 'ALL' ? {} : { opportunity: value }, { replace: true });
  };

  const compareHint = selected.length < 2
    ? `Select 2 or ${MAX_COMPARE} applicants to compare.`
    : samePosting ? `${selected.length} selected.` : 'Select applicants for the same posting to compare.';

  return (
    <div>
      <PageHeader title="Applications" description="Review applicants, compare skills and update their recruitment status." />

      <div className="mb-5 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-card xl:flex-row">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or skill" className="flex-1" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex">
          <FilterSelect label="Posting" value={posting} onChange={setPosting} allLabel="All postings" options={postings.map((entry) => ({ value: entry.id, label: entry.title }))} />
          <FilterSelect label="Status" value={status} onChange={setStatus} allLabel="All statuses" options={STATUS_OPTIONS} />
          <FilterSelect label="Sort by" value={sort} onChange={setSort} options={[{ value: 'recent', label: 'Most recent' }, { value: 'match', label: 'Best skill match' }]} />
        </div>
      </div>

      <div className="mb-3 flex min-h-9 flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{compareHint}</p>
        <Button variant="secondary" size="sm" icon={Columns3} disabled={!canCompare} onClick={() => setComparing(true)}>Compare skills</Button>
      </div>

      {error && <Card><ErrorState message={error} onRetry={fetchReceived} /></Card>}
      {!error && (
        <Card padded={false}>
          {loading && !applications.length ? (
            <div className="space-y-3 p-5" role="status" aria-label="Loading">
              {[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-12 w-full" />)}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={applications.length ? 'No applications match these filters' : 'No applications yet'}
              description={applications.length ? 'Try changing your filters.' : 'Applications will appear here when candidates apply to your postings.'}
            />
          ) : (
            <TableShell>
              <table className="w-full min-w-[840px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th scope="col" className="w-10 py-2.5 pl-5"><span className="sr-only">Select to compare</span></th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Candidate</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Posting</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Match</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Applied</th>
                    <th scope="col" className="px-5 py-2.5"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((application) => (
                    <tr key={application.id} className="hover:bg-slate-50/70">
                      <td className="py-3 pl-5">
                        <input
                          type="checkbox"
                          checked={selected.includes(application.id)}
                          disabled={!selected.includes(application.id) && selected.length >= MAX_COMPARE}
                          onChange={() => toggleSelected(application.id)}
                          aria-label={`Select ${application.candidate?.fullName} to compare`}
                          className="size-4 cursor-pointer accent-brand-600"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={application.candidate?.fullName} size="sm" />
                          <div className="min-w-0">
                            <Link to={`/recruiter/candidates/${application.candidateId}`} className="font-semibold whitespace-nowrap text-slate-900 hover:text-brand-700">{application.candidate?.fullName}</Link>
                            <p className="max-w-56 truncate text-xs text-slate-500">{application.candidate?.university}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-56 truncate px-3 py-3 text-slate-700">{application.opportunity?.title}</td>
                      <td className="px-3 py-3"><MatchBadge score={application.matchScore} /></td>
                      <td className="px-3 py-3"><StatusBadge status={application.status} /></td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600">{formatDate(application.appliedAt, { day: 'numeric', month: 'short' })}</td>
                      <td className="px-5 py-3 text-right"><Button variant="secondary" size="sm" onClick={() => setReviewId(application.id)}>Review</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Card>
      )}

      {reviewing && !scheduling && <ReviewModal application={reviewing} onClose={() => setReviewId(null)} onSchedule={() => setScheduleId(reviewing.id)} />}
      {scheduling && <InterviewModal application={scheduling} onClose={() => setScheduleId(null)} />}
      {comparing && canCompare && <CompareModal applications={selectedApplications} onClose={() => setComparing(false)} />}
    </div>
  );
}
