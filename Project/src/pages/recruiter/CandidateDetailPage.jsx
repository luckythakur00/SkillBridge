import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, ClipboardList, FileText, Mail, Minus, Phone, Target, XCircle } from 'lucide-react';
import { StatusBadge } from '../../components/applications/ApplicationParts';
import { MatchBadge } from '../../components/opportunities/OpportunityCard';
import PortfolioView, { SkillsByLevel, TimelineList } from '../../components/profile/PortfolioView';
import { educationItems, experienceItems } from '../../utils/profileItems';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { FilterSelect } from '../../components/ui/Form';
import { Card, EmptyState, ErrorState, PageHeader, PageLoader, SectionHeading } from '../../components/ui/Primitives';
import { useRecruiterStore } from '../../store/recruiterStore';
import { useJobStore } from '../../store/jobStore';
import { computeMatch } from '../../utils/skillMatch';
import { SKILL_LEVEL_LABEL } from '../../constants';
import { formatDate, formatFileSize } from '../../utils/format';
import { USE_MOCK_API } from '../../config/app';

function ResumeModal({ candidate, onClose }) {
  const { resume } = candidate;
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Resume"
      description={`${resume.fileName} · ${formatFileSize(resume.fileSize)} · Uploaded ${formatDate(resume.uploadedAt)}`}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {USE_MOCK_API && (
        <p className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          The demo keeps only the file details, so this is a summary built from the profile. The original file can be opened once the backend stores uploads.
        </p>
      )}
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-bold">{candidate.fullName}</h3>
          <p className="text-sm text-slate-600">{candidate.headline}</p>
          <p className="mt-1 text-sm text-slate-500">{[candidate.email, candidate.phone, candidate.location].filter(Boolean).join(' · ')}</p>
        </div>
        {candidate.education.length > 0 && <div><h4 className="mb-2 text-sm font-bold">Education</h4><TimelineList items={educationItems(candidate.education)} /></div>}
        {candidate.experience.length > 0 && <div><h4 className="mb-2 text-sm font-bold">Experience</h4><TimelineList items={experienceItems(candidate.experience)} /></div>}
        <div><h4 className="mb-2 text-sm font-bold">Skills</h4><SkillsByLevel skills={candidate.skills} /></div>
      </div>
    </Modal>
  );
}

function CompatibilityCard({ candidate, postings }) {
  const open = postings.filter((posting) => posting.state === 'ACTIVE');
  const defaultId = candidate.applications[0]?.opportunityId ?? open[0]?.id ?? '';
  const [opportunityId, setOpportunityId] = useState(defaultId);
  const posting = postings.find((entry) => entry.id === (opportunityId || defaultId));
  const match = useMemo(() => (posting ? computeMatch(candidate.skills, posting.requiredSkills) : null), [candidate.skills, posting]);

  return (
    <Card>
      <SectionHeading title="Skill compatibility" icon={Target} />
      {!postings.length ? (
        <p className="text-sm text-slate-500">Create a posting to compare this candidate against its requirements.</p>
      ) : (
        <>
          <FilterSelect label="Compare with posting" value={posting?.id ?? ''} onChange={setOpportunityId} options={postings.map((entry) => ({ value: entry.id, label: entry.title }))} />
          {match && (
            <>
              <div className="mt-4"><MatchBadge score={match.score} /></div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {match.matched.map((skill) => <li key={skill.name} className="flex items-start gap-2 text-slate-700"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Met" />{skill.name}</li>)}
                {match.partial.map((skill) => <li key={skill.name} className="flex items-start gap-2 text-slate-700"><Minus className="mt-0.5 size-4 shrink-0 text-amber-600" aria-label="Partly met" />{skill.name}: has {SKILL_LEVEL_LABEL[skill.currentLevel]}, needs {SKILL_LEVEL_LABEL[skill.level]}</li>)}
                {match.missing.map((skill) => <li key={skill.name} className="flex items-start gap-2 text-slate-500"><XCircle className="mt-0.5 size-4 shrink-0 text-slate-400" aria-label="Missing" />{skill.name}</li>)}
              </ul>
            </>
          )}
        </>
      )}
    </Card>
  );
}

export default function CandidateDetailPage() {
  const { id } = useParams();
  const candidate = useRecruiterStore((state) => state.candidate);
  const error = useRecruiterStore((state) => state.errors.candidate);
  const fetchCandidate = useRecruiterStore((state) => state.fetchCandidate);
  const postings = useJobStore((state) => state.postings);
  const fetchPostings = useJobStore((state) => state.fetchPostings);
  const [resumeOpen, setResumeOpen] = useState(false);

  useEffect(() => {
    fetchCandidate(id);
    fetchPostings();
  }, [id, fetchCandidate, fetchPostings]);

  const header = <PageHeader title="Candidate profile" backTo="/recruiter/candidates" backLabel="Back to candidate search" />;

  if (error) {
    return (
      <>
        {header}
        <Card>
          {error.includes('not found')
            ? <EmptyState title="Candidate not found" description="This profile may have been removed." />
            : <ErrorState message={error} onRetry={() => fetchCandidate(id)} />}
        </Card>
      </>
    );
  }
  if (!candidate || candidate.id !== id) return <PageLoader />;

  return (
    <div>
      {header}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><PortfolioView portfolio={candidate} /></div>
        <aside className="space-y-6">
          <Card>
            <SectionHeading title="Contact" />
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2 break-all"><Mail className="size-4 shrink-0 text-slate-400" aria-hidden="true" />{candidate.email}</li>
              {candidate.phone && <li className="flex items-center gap-2"><Phone className="size-4 shrink-0 text-slate-400" aria-hidden="true" />{candidate.phone}</li>}
            </ul>
            <div className="mt-4 border-t border-slate-100 pt-4">
              {candidate.resume
                ? <Button variant="secondary" icon={FileText} fullWidth onClick={() => setResumeOpen(true)}>View resume</Button>
                : <p className="text-sm text-slate-500">No resume uploaded.</p>}
            </div>
          </Card>

          <CompatibilityCard key={`${candidate.id}-${postings.length}`} candidate={candidate} postings={postings} />

          <Card>
            <SectionHeading title="Applications to you" icon={ClipboardList} />
            {candidate.applications.length === 0 ? (
              <p className="text-sm text-slate-500">This candidate has not applied to your postings.</p>
            ) : (
              <ul className="space-y-3">
                {candidate.applications.map((application) => (
                  <li key={application.id}>
                    <Link to={`/recruiter/applications?opportunity=${application.opportunityId}`} className="block rounded-lg border border-slate-200 p-3 transition-colors hover:border-brand-300">
                      <p className="text-sm font-semibold text-slate-900">{application.opportunity?.title}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <StatusBadge status={application.status} />
                        <span className="text-xs text-slate-500">{formatDate(application.appliedAt, { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
      {resumeOpen && <ResumeModal candidate={candidate} onClose={() => setResumeOpen(false)} />}
    </div>
  );
}
