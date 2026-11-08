import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Check, Clock, MapPin, Ticket, Users } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FilterSelect, SearchInput } from '../ui/Form';
import { Badge, Card, CardGridSkeleton, DetailItem, EmptyState, ErrorState, OrgLogo, ProgressBar, SkillTag } from '../ui/Primitives';
import { useTrainingStore } from '../../store/trainingStore';
import { useAuthStore } from '../../store/authStore';
import { useAction } from '../../hooks/useAction';
import { PROGRAM_TYPE_LABELS, WORK_MODE_LABELS } from '../../constants';
import { formatDate, formatFee } from '../../utils/format';

function EnrollButton({ program, fullWidth = false, onDone }) {
  const enroll = useTrainingStore((state) => state.enroll);
  const unenroll = useTrainingStore((state) => state.unenroll);
  const [join, joining] = useAction(() => enroll(program.id), { success: `You are registered for ${program.title}.` });
  const [leave, leaving] = useAction(() => unenroll(program), { success: 'Your registration was cancelled.' });

  if (program.isEnrolled) {
    return <Button variant="secondary" icon={Check} loading={leaving} fullWidth={fullWidth} onClick={async () => { if (await leave()) onDone?.(); }}>Cancel registration</Button>;
  }
  return (
    <Button disabled={program.seatsLeft === 0} loading={joining} fullWidth={fullWidth} onClick={async () => { if (await join()) onDone?.(); }}>
      {program.seatsLeft === 0 ? 'Full' : 'Register'}
    </Button>
  );
}

function ProgramDetailModal({ program, onClose }) {
  return (
    <Modal
      open={Boolean(program)}
      onClose={onClose}
      title={program?.title ?? ''}
      description={program?.organization?.name}
      footer={program && (
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <EnrollButton program={program} onDone={onClose} />
        </>
      )}
    >
      {program && (
        <div className="space-y-5">
          <Badge tone="brand">{PROGRAM_TYPE_LABELS[program.type]}</Badge>
          <p className="text-sm leading-relaxed text-slate-600">{program.description}</p>
          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <DetailItem icon={CalendarDays} label="Starts">{formatDate(program.startDate)}</DetailItem>
            <DetailItem icon={Clock} label="Duration">{program.duration}</DetailItem>
            <DetailItem icon={MapPin} label="Format">{WORK_MODE_LABELS[program.mode]}, {program.location}</DetailItem>
            <DetailItem icon={Ticket} label="Fee">{formatFee(program.fee)}{program.stipendNote ? ` · ${program.stipendNote}` : ''}</DetailItem>
            <DetailItem icon={Users} label="Seats left">{program.seatsLeft} of {program.seats}</DetailItem>
            <DetailItem icon={CalendarDays} label="Register by">{formatDate(program.deadline)}</DetailItem>
          </div>
          {program.skills.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500">Skills covered</p>
              <div className="flex flex-wrap gap-1.5">{program.skills.map((skill) => <SkillTag key={skill}>{skill}</SkillTag>)}</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function ProgramCard({ program, onOpen }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-brand-300 hover:shadow-raised">
      <div className="flex items-start gap-3">
        <OrgLogo organization={program.organization} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-slate-500">{program.organization?.name}</p>
          <h3 className="mt-0.5 text-[15px] leading-snug font-bold">{program.title}</h3>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="brand">{PROGRAM_TYPE_LABELS[program.type]}</Badge>
        {program.isEnrolled && <Badge tone="success" icon={Check}>Registered</Badge>}
      </div>
      <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-600">{program.description}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
        <li className="flex items-center gap-2"><CalendarDays className="size-4 shrink-0 text-slate-400" aria-hidden="true" />{formatDate(program.startDate)} · {program.duration}</li>
        <li className="flex items-center gap-2"><Ticket className="size-4 shrink-0 text-slate-400" aria-hidden="true" />{formatFee(program.fee)}{program.stipendNote ? ` · ${program.stipendNote}` : ''}</li>
      </ul>
      <Button variant="secondary" className="mt-4" fullWidth onClick={() => onOpen(program.id)}>View details</Button>
    </article>
  );
}

export function EnrollmentsPanel({ enrollments }) {
  if (!enrollments.length) return null;
  return (
    <Card className="mb-6">
      <h2 className="mb-4 text-base font-bold">My registered programs</h2>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {enrollments.map((enrollment) => (
          <li key={enrollment.id} className="min-w-0">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-sm font-medium text-slate-900">{enrollment.program.title}</p>
              <span className="shrink-0 text-xs text-slate-500">{enrollment.progress > 0 ? `${enrollment.progress}%` : `Starts ${formatDate(enrollment.program.startDate, { day: 'numeric', month: 'short' })}`}</span>
            </div>
            <div className="mt-1.5"><ProgressBar value={enrollment.progress} size="sm" label={`${enrollment.program.title} progress`} /></div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// Used by Learning Programs and Academic Opportunities. `filter` picks the programs for that page.
export default function ProgramBrowser({ params, types, filter, emptyTitle }) {
  const programs = useTrainingStore((state) => state.programs);
  const loading = useTrainingStore((state) => state.loading.programs);
  const error = useTrainingStore((state) => state.errors.programs);
  const fetchPrograms = useTrainingStore((state) => state.fetchPrograms);
  const category = useAuthStore((state) => state.user?.category);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('ALL');
  const [forMe, setForMe] = useState(true);
  const [openId, setOpenId] = useState(null);

  const paramsKey = JSON.stringify(params ?? {});
  useEffect(() => {
    fetchPrograms(JSON.parse(paramsKey));
  }, [fetchPrograms, paramsKey]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return programs
      .filter((program) => !filter || filter(program))
      .filter((program) => type === 'ALL' || program.type === type)
      .filter((program) => !forMe || program.audience.includes(category))
      .filter((program) => !text || program.title.toLowerCase().includes(text) || program.skills.some((skill) => skill.toLowerCase().includes(text)));
  }, [programs, filter, type, forMe, category, query]);

  const typeOptions = types.map((value) => ({ value, label: PROGRAM_TYPE_LABELS[value] }));
  const openProgram = programs.find((program) => program.id === openId) ?? null;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-card md:flex-row md:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by title or skill" className="flex-1" />
        <FilterSelect label="Program type" value={type} onChange={setType} allLabel="All types" options={typeOptions} />
        <label className="flex cursor-pointer items-center gap-2 px-1 py-2 text-sm font-medium whitespace-nowrap text-slate-700">
          <input type="checkbox" checked={forMe} onChange={(event) => setForMe(event.target.checked)} className="size-4 accent-brand-600" />
          Relevant to me
        </label>
      </div>

      {error && <Card><ErrorState message={error} onRetry={() => fetchPrograms(params)} /></Card>}
      {!error && loading && !programs.length && <CardGridSkeleton />}
      {!error && !loading && !visible.length && (
        <Card>
          <EmptyState
            icon={BookOpen}
            title={emptyTitle}
            description={forMe ? 'Turn off "Relevant to me" to see everything that is available.' : 'Try a different search or program type.'}
          />
        </Card>
      )}
      {!error && visible.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((program) => <ProgramCard key={program.id} program={program} onOpen={setOpenId} />)}
        </div>
      )}
      <ProgramDetailModal program={openProgram} onClose={() => setOpenId(null)} />
    </div>
  );
}
