import { Check, CircleSlash, Clock, Video, MapPin, Phone } from 'lucide-react';
import { Badge } from '../ui/Primitives';
import { APPLICATION_PIPELINE, APPLICATION_STATUS, INTERVIEW_MODES } from '../../constants';
import { formatDate, formatDateTime } from '../../utils/format';

export function StatusBadge({ status }) {
  const meta = APPLICATION_STATUS[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

// Shows completed steps with dates, and the steps still ahead for an application in progress.
export function ApplicationTimeline({ application }) {
  const { timeline, status } = application;
  const isEnded = ['REJECTED', 'WITHDRAWN', 'SELECTED'].includes(status);
  const reached = timeline.map((step) => step.status);
  const upcoming = isEnded ? [] : APPLICATION_PIPELINE.filter((step) => !reached.includes(step));

  return (
    <ol className="space-y-0">
      {timeline.map((step, index) => {
        const isLast = index === timeline.length - 1 && !upcoming.length;
        const negative = ['REJECTED', 'WITHDRAWN'].includes(step.status);
        return (
          <li key={`${step.status}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && <span className="absolute top-6 bottom-0 left-[11px] w-0.5 bg-brand-200" aria-hidden="true" />}
            <span className={`z-10 flex size-6 shrink-0 items-center justify-center rounded-full ${negative ? 'bg-slate-200 text-slate-600' : 'bg-brand-600 text-white'}`}>
              {negative ? <CircleSlash className="size-3.5" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">{APPLICATION_STATUS[step.status].label}</p>
              <p className="text-xs text-slate-500">{formatDate(step.at)}</p>
              {step.note && <p className="mt-1 text-sm text-slate-600">{step.note}</p>}
            </div>
          </li>
        );
      })}
      {upcoming.map((step, index) => (
        <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
          {index < upcoming.length - 1 && <span className="absolute top-6 bottom-0 left-[11px] w-0.5 bg-slate-200" aria-hidden="true" />}
          <span className="z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white" aria-hidden="true" />
          <p className="pt-0.5 text-sm text-slate-500">{APPLICATION_STATUS[step].label}</p>
        </li>
      ))}
    </ol>
  );
}

const MODE_ICON = { VIDEO: Video, PHONE: Phone, IN_PERSON: MapPin };

export function InterviewCard({ interview }) {
  const Icon = MODE_ICON[interview.mode] ?? Clock;
  const modeLabel = INTERVIEW_MODES.find((mode) => mode.value === interview.mode)?.label;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-slate-900">Interview: {formatDateTime(interview.scheduledAt)}</p>
        <p className="text-slate-600">{modeLabel}{interview.details ? `. ${interview.details}` : ''}</p>
      </div>
    </div>
  );
}
