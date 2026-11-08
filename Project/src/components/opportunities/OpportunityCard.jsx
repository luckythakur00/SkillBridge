import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, CalendarClock, IndianRupee, MapPin, Wallet } from 'lucide-react';
import { Badge, OrgLogo, SkillTag, VerifiedMark } from '../ui/Primitives';
import { APPLICATION_STATUS, OPPORTUNITY_TYPE_LABELS, WORK_MODE_LABELS } from '../../constants';
import { daysUntil, formatCompensation, formatDeadline } from '../../utils/format';
import { matchLabel, matchTone } from '../../utils/skillMatch';
import { useJobStore } from '../../store/jobStore';
import { useAction } from '../../hooks/useAction';

export function SaveButton({ opportunity, withLabel = false }) {
  const toggleSaved = useJobStore((state) => state.toggleSaved);
  const [toggle, pending] = useAction(() => toggleSaved(opportunity));
  const { isSaved } = opportunity;
  const label = isSaved ? 'Remove bookmark' : 'Save opportunity';
  const Icon = isSaved ? BookmarkCheck : Bookmark;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        toggle();
      }}
      disabled={pending}
      aria-label={label}
      aria-pressed={isSaved}
      title={label}
      className={`relative z-10 inline-flex items-center gap-2 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-60 ${
        withLabel ? 'h-10 px-4' : 'size-9 justify-center'
      } ${isSaved ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {withLabel && (isSaved ? 'Saved' : 'Save')}
    </button>
  );
}

export function MatchBadge({ score }) {
  return <Badge tone={matchTone(score)}>{score}% · {matchLabel(score)}</Badge>;
}

export default function OpportunityCard({ opportunity, basePath = '/opportunities' }) {
  const { organization, requiredSkills, matchScore, isSaved, applicationStatus } = opportunity;
  const PayIcon = opportunity.compensation?.currency === 'INR' ? IndianRupee : Wallet;
  const urgent = daysUntil(opportunity.deadline) <= 7;
  const extraSkills = requiredSkills.length - 4;

  return (
    <article className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-brand-300 hover:shadow-raised">
      <div className="flex items-start gap-3">
        <OrgLogo organization={organization} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <span className="truncate">{organization?.name}</span>
            {organization?.verificationStatus === 'VERIFIED' && <VerifiedMark label="Verified organization" />}
          </p>
          <h3 className="mt-0.5 text-[15px] leading-snug font-bold transition-colors group-hover:text-brand-700">
            <Link to={`${basePath}/${opportunity.id}`} className="after:absolute after:inset-0 after:rounded-xl">
              {opportunity.title}
            </Link>
          </h3>
        </div>
        {isSaved !== undefined && <SaveButton opportunity={opportunity} />}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="brand">{OPPORTUNITY_TYPE_LABELS[opportunity.type]}</Badge>
        <Badge>{WORK_MODE_LABELS[opportunity.workMode]}</Badge>
        {matchScore !== undefined && <MatchBadge score={matchScore} />}
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
        <li className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-slate-400" aria-hidden="true" /><span className="truncate">{opportunity.location}</span></li>
        <li className="flex items-center gap-2"><PayIcon className="size-4 shrink-0 text-slate-400" aria-hidden="true" /><span className="truncate">{formatCompensation(opportunity.compensation)}</span></li>
        <li className={`flex items-center gap-2 ${urgent ? 'font-medium text-amber-800' : ''}`}>
          <CalendarClock className={`size-4 shrink-0 ${urgent ? 'text-amber-600' : 'text-slate-400'}`} aria-hidden="true" />
          {formatDeadline(opportunity.deadline)}
        </li>
      </ul>

      <div className="mt-4 flex flex-1 flex-wrap content-end gap-1.5">
        {requiredSkills.slice(0, 4).map((skill) => <SkillTag key={skill.name}>{skill.name}</SkillTag>)}
        {extraSkills > 0 && <SkillTag muted>+{extraSkills}</SkillTag>}
      </div>

      {applicationStatus && (
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
          Your application: {APPLICATION_STATUS[applicationStatus].label}
        </p>
      )}
    </article>
  );
}
