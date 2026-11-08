import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, Briefcase, CalendarClock, CheckCircle2, CircleDashed, Clock, Globe2, GraduationCap, ListChecks, LogIn, MapPin, Users, Wallet, XCircle,
} from 'lucide-react';
import ApplyModal from './ApplyModal';
import { MatchBadge, SaveButton } from './OpportunityCard';
import Button from '../ui/Button';
import { Badge, Card, DetailItem, EmptyState, ErrorState, OrgLogo, PageLoader, SectionHeading, SkillTag, VerifiedMark } from '../ui/Primitives';
import { useAuthStore } from '../../store/authStore';
import { useJobStore } from '../../store/jobStore';
import {
  APPLICATION_STATUS, EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS, OPPORTUNITY_TYPE_LABELS, ORGANIZATION_TYPE_LABELS,
  POSTING_STATE, SKILL_LEVEL_LABEL, WORK_MODE_LABELS,
} from '../../constants';
import { formatCompensation, formatDate, pluralize } from '../../utils/format';

function BulletList({ items }) {
  return (
    <ul className="space-y-2 text-sm text-slate-600">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function MatchPanel({ match }) {
  const groups = [
    { key: 'matched', icon: CheckCircle2, color: 'text-emerald-600', label: 'Requirement met', items: match.matched },
    { key: 'partial', icon: CircleDashed, color: 'text-amber-600', label: 'Level below requirement', items: match.partial },
    { key: 'missing', icon: XCircle, color: 'text-slate-400', label: 'Not on your profile', items: match.missing },
  ];
  return (
    <Card>
      <SectionHeading title="Your skill match" action={<MatchBadge score={match.score} />} />
      <div className="space-y-4">
        {groups.filter((group) => group.items.length).map(({ key, icon: Icon, color, label, items }) => (
          <div key={key}>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Icon className={`size-3.5 ${color}`} aria-hidden="true" />
              {label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((skill) => <SkillTag key={skill.name} verified={skill.verified}>{skill.name}</SkillTag>)}
            </div>
          </div>
        ))}
      </div>
      <Link to="/candidate/skill-mapping" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
        See how to close these gaps
      </Link>
    </Card>
  );
}

export default function OpportunityDetail({ backTo }) {
  const { id } = useParams();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const opportunity = useJobStore((state) => state.current);
  const loading = useJobStore((state) => state.loading.current);
  const error = useJobStore((state) => state.errors.current);
  const fetchOne = useJobStore((state) => state.fetchOne);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    fetchOne(id);
  }, [fetchOne, id]);

  const backLink = (
    <Link to={backTo} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to opportunities
    </Link>
  );

  if (error) {
    return (
      <>
        {backLink}
        <Card>
          {error.includes('not found')
            ? <EmptyState icon={Briefcase} title="This opportunity is no longer available" description="It may have been removed by the organization." />
            : <ErrorState message={error} onRetry={() => fetchOne(id)} />}
        </Card>
      </>
    );
  }
  if (loading || !opportunity) return <PageLoader />;

  const { organization, requiredSkills } = opportunity;
  const isOpen = opportunity.state === 'ACTIVE';
  const isCandidate = user?.role === 'CANDIDATE';
  const technical = requiredSkills.filter((skill) => skill.type === 'TECHNICAL');
  const soft = requiredSkills.filter((skill) => skill.type === 'SOFT');

  let action;
  if (opportunity.applicationStatus) {
    action = <Button to="/candidate/applications" variant="secondary" icon={CheckCircle2} fullWidth>{APPLICATION_STATUS[opportunity.applicationStatus].label}: view application</Button>;
  } else if (!isOpen) {
    action = <p className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"><AlertTriangle className="size-4 shrink-0" aria-hidden="true" />This opportunity is no longer accepting applications.</p>;
  } else if (isCandidate) {
    action = <Button size="lg" onClick={() => setApplyOpen(true)} fullWidth>Apply now</Button>;
  } else if (user) {
    action = <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">You are signed in as a recruiter. Only candidate accounts can apply.</p>;
  } else {
    const next = encodeURIComponent(`/candidate/opportunities/${id}`);
    action = <Button to={`/login/candidate?next=${next}`} state={{ from: location.pathname }} size="lg" icon={LogIn} fullWidth>Sign in to apply</Button>;
  }

  return (
    <>
      {backLink}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex items-start gap-4">
              <OrgLogo organization={organization} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-sm text-slate-500">
                  {organization?.name}
                  {organization?.verificationStatus === 'VERIFIED' && <VerifiedMark label="Verified organization" />}
                </p>
                <h1 className="mt-0.5 text-2xl leading-tight font-bold">{opportunity.title}</h1>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone="brand">{OPPORTUNITY_TYPE_LABELS[opportunity.type]}</Badge>
                  <Badge>{WORK_MODE_LABELS[opportunity.workMode]}</Badge>
                  {!isOpen && <Badge tone={POSTING_STATE[opportunity.state].tone}>{POSTING_STATE[opportunity.state].label}</Badge>}
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <DetailItem icon={MapPin} label="Location">{opportunity.location}</DetailItem>
              <DetailItem icon={Wallet} label={opportunity.type === 'JOB' ? 'Salary' : 'Stipend'}>{formatCompensation(opportunity.compensation)}</DetailItem>
              {opportunity.type === 'JOB'
                ? <DetailItem icon={Briefcase} label="Employment">{EMPLOYMENT_TYPE_LABELS[opportunity.employmentType]}</DetailItem>
                : <DetailItem icon={Clock} label="Duration">{pluralize(opportunity.durationMonths, 'month')}</DetailItem>}
              <DetailItem icon={GraduationCap} label="Experience">{EXPERIENCE_LEVEL_LABELS[opportunity.experienceLevel]}</DetailItem>
              <DetailItem icon={CalendarClock} label="Apply by">{formatDate(opportunity.deadline)}</DetailItem>
              <DetailItem icon={Users} label="Openings">{opportunity.openings}</DetailItem>
            </div>
          </Card>

          <Card>
            <SectionHeading title="About this role" />
            <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">{opportunity.description}</p>
            {opportunity.responsibilities?.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2.5 text-sm font-bold">What you will do</h3>
                <BulletList items={opportunity.responsibilities} />
              </div>
            )}
          </Card>

          <Card>
            <SectionHeading title="Eligibility" icon={ListChecks} />
            <p className="text-sm leading-relaxed text-slate-600">{opportunity.eligibility}</p>
            {opportunity.qualifications?.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2.5 text-sm font-bold">Qualifications</h3>
                <BulletList items={opportunity.qualifications} />
              </div>
            )}
          </Card>

          <Card>
            <SectionHeading title="Required skills" />
            {[['Technical', technical], ['Soft skills', soft]].filter(([, list]) => list.length).map(([label, list]) => (
              <div key={label} className="mb-4 last:mb-0">
                <h3 className="mb-2 text-xs font-semibold text-slate-500">{label}</h3>
                <ul className="flex flex-wrap gap-2">
                  {list.map((skill) => (
                    <li key={skill.name}>
                      <SkillTag>{skill.name} · {SKILL_LEVEL_LABEL[skill.level]}</SkillTag>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="lg:sticky lg:top-24">
            <div className="flex gap-2">
              <div className="flex-1">{action}</div>
              {isCandidate && isOpen && <SaveButton opportunity={opportunity} />}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">{pluralize(opportunity.applicantCount, 'applicant')} so far</p>
          </Card>
          {opportunity.match && <MatchPanel match={opportunity.match} />}
          <Card>
            <SectionHeading title="About the organization" />
            <p className="text-sm font-semibold text-slate-900">{organization?.name}</p>
            <ul className="mt-2.5 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Globe2 className="size-4 text-slate-400" aria-hidden="true" />{ORGANIZATION_TYPE_LABELS[organization?.type]}</li>
              {organization?.industry && <li className="flex items-center gap-2"><Briefcase className="size-4 text-slate-400" aria-hidden="true" />{organization.industry}</li>}
              {organization?.location && <li className="flex items-center gap-2"><MapPin className="size-4 text-slate-400" aria-hidden="true" />{organization.location}</li>}
            </ul>
          </Card>
        </aside>
      </div>

      {isCandidate && <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} opportunity={opportunity} />}
    </>
  );
}
