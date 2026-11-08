import { useEffect, useMemo, useState } from 'react';
import { Handshake, Library, Pencil, Plus, Trash2, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { Checkbox, Field, FilterSelect, FormField } from '../../components/ui/Form';
import { Avatar, Badge, Card, EmptyState, ErrorState, PageHeader, Skeleton, TableShell } from '../../components/ui/Primitives';
import { useTrainingStore } from '../../store/trainingStore';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { futureDate, numberRange, required } from '../../utils/validators';
import {
  CANDIDATE_CATEGORIES, CANDIDATE_CATEGORY_LABELS, POSTING_STATE, PROGRAM_GROUPS, PROGRAM_TYPE_LABELS, programTypeOptions, WORK_MODES,
} from '../../constants';
import { formatDate, formatFee, toDateInput } from '../../utils/format';

const COPY = {
  LEARNING: {
    title: 'Learning programs',
    description: 'Publish training, certification courses, workshops, mentorship and live industry projects.',
    icon: Library,
    noun: 'program',
    defaultAudience: ['STUDENT', 'GRADUATE', 'PROFESSIONAL'],
  },
  COLLABORATION: {
    title: 'Collaboration opportunities',
    description: 'Publish guest lectures, research, faculty programs, industrial training and consultancy.',
    icon: Handshake,
    noun: 'opportunity',
    defaultAudience: ['ACADEMICIAN'],
  },
};

function ProgramFormModal({ group, program, onClose }) {
  const copy = COPY[group];
  const createProgram = useTrainingStore((state) => state.createProgram);
  const updateProgram = useTrainingStore((state) => state.updateProgram);
  const [audience, setAudience] = useState(program?.audience ?? copy.defaultAudience);
  const [audienceError, setAudienceError] = useState('');
  const form = useForm(
    {
      type: program?.type ?? PROGRAM_GROUPS[group][0],
      title: program?.title ?? '',
      description: program?.description ?? '',
      skills: (program?.skills ?? []).join(', '),
      mode: program?.mode ?? 'REMOTE',
      location: program?.location ?? 'Online',
      startDate: toDateInput(program?.startDate),
      deadline: toDateInput(program?.deadline),
      duration: program?.duration ?? '',
      feeAmount: program?.fee?.amount ?? '',
      seats: program?.seats ?? 30,
      stipendNote: program?.stipendNote ?? '',
    },
    {
      title: [required('Title')],
      description: [required('Description')],
      location: [required('Location')],
      startDate: [required('Start date')],
      deadline: [required('Registration deadline'), ...(program ? [] : [futureDate('Deadline')])],
      duration: [required('Duration')],
      feeAmount: [numberRange(0, 10000000, 'Fee')],
      seats: [required('Seats'), numberRange(1, 10000, 'Seats')],
    },
  );
  const [save, saving] = useAction(
    (payload) => (program ? updateProgram(program.id, payload) : createProgram(payload)),
    { success: program ? 'Changes saved.' : 'Published. Candidates can now register.', form },
  );

  const toggleAudience = (value) => {
    setAudienceError('');
    setAudience((current) => (current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const valid = form.validate();
    if (!audience.length) setAudienceError('Choose at least one audience.');
    if (!valid || !audience.length) return;
    const { values } = form;
    const saved = await save({
      type: values.type,
      title: values.title.trim(),
      description: values.description.trim(),
      audience,
      skills: values.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      mode: values.mode,
      location: values.location.trim(),
      startDate: new Date(`${values.startDate}T09:00:00`).toISOString(),
      deadline: new Date(`${values.deadline}T23:59:59`).toISOString(),
      duration: values.duration.trim(),
      fee: Number(values.feeAmount) ? { amount: Number(values.feeAmount), currency: 'INR' } : null,
      seats: Number(values.seats),
      stipendNote: values.stipendNote.trim() || undefined,
      status: program?.status ?? 'ACTIVE',
    });
    if (saved) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={program ? `Edit ${copy.noun}` : `New ${copy.noun}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="program-form" loading={saving}>{program ? 'Save changes' : 'Publish'}</Button>
        </>
      }
    >
      <form id="program-form" onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field form={form} as="select" name="type" label="Type" options={programTypeOptions(group)} />
        <Field form={form} name="duration" label="Duration" required placeholder="8 weeks" />
        <Field form={form} name="title" label="Title" required className="sm:col-span-2" />
        <Field form={form} as="textarea" name="description" label="Description" required className="sm:col-span-2" />
        <Field form={form} name="skills" label="Skills covered" hint="Separate with commas." className="sm:col-span-2" />
        <Field form={form} as="select" name="mode" label="Format" options={WORK_MODES} />
        <Field form={form} name="location" label="Location" required />
        <Field form={form} name="startDate" type="date" label="Start date" required />
        <Field form={form} name="deadline" type="date" label="Register by" required />
        <Field form={form} name="seats" type="number" min="1" label="Seats" required />
        <Field form={form} name="feeAmount" type="number" min="0" label="Fee in ₹" hint="Leave blank if free." />
        <Field form={form} name="stipendNote" label="Stipend or funding note" placeholder="Grant funded: ₹20,000 per month" className="sm:col-span-2" />
        <FormField id="audience" label="Open to" required error={audienceError} className="sm:col-span-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CANDIDATE_CATEGORIES.map((category) => (
              <Checkbox key={category.value} id={`audience-${category.value}`} checked={audience.includes(category.value)} onChange={() => toggleAudience(category.value)}>
                {category.label}
              </Checkbox>
            ))}
          </div>
        </FormField>
      </form>
    </Modal>
  );
}

function EnrolleesModal({ program, onClose }) {
  const fetchEnrollees = useTrainingStore((state) => state.fetchEnrollees);
  const [enrollees, setEnrollees] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrollees(program.id).then(setEnrollees).catch((failure) => setError(failure.message));
  }, [program.id, fetchEnrollees]);

  return (
    <Modal open onClose={onClose} title="Registered candidates" description={program.title} footer={<Button onClick={onClose}>Close</Button>}>
      {error && <ErrorState message={error} />}
      {!error && !enrollees && <Skeleton className="h-24 w-full" />}
      {enrollees?.length === 0 && <EmptyState compact icon={Users} title="No registrations yet" description="Candidates who register will be listed here." />}
      {enrollees?.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {enrollees.map((enrollee) => (
            <li key={enrollee.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar name={enrollee.candidate?.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{enrollee.candidate?.fullName}</p>
                <p className="truncate text-xs text-slate-500">{enrollee.candidate?.headline}</p>
              </div>
              <Badge>{CANDIDATE_CATEGORY_LABELS[enrollee.candidate?.category]}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export default function ProgramsPage({ group }) {
  const copy = COPY[group];
  const managed = useTrainingStore((state) => state.managed);
  const loading = useTrainingStore((state) => state.loading.managed);
  const error = useTrainingStore((state) => state.errors.managed);
  const fetchManaged = useTrainingStore((state) => state.fetchManaged);
  const deleteProgram = useTrainingStore((state) => state.deleteProgram);
  const [type, setType] = useState('ALL');
  const [editing, setEditing] = useState(null); // null, 'new', or a program
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [remove, removing] = useAction((id) => deleteProgram(id), { success: 'Deleted. Registered candidates have been told.' });

  useEffect(() => {
    fetchManaged();
  }, [fetchManaged]);

  const inGroup = useMemo(() => managed.filter((program) => PROGRAM_GROUPS[group].includes(program.type)), [managed, group]);
  const visible = inGroup.filter((program) => type === 'ALL' || program.type === type);

  return (
    <div>
      <PageHeader title={copy.title} description={copy.description} actions={<Button icon={Plus} onClick={() => setEditing('new')}>New {copy.noun}</Button>} />

      {error && <Card><ErrorState message={error} onRetry={fetchManaged} /></Card>}
      {!error && (
        <Card padded={false}>
          <div className="border-b border-slate-200 p-4">
            <FilterSelect label="Filter by type" value={type} onChange={setType} allLabel="All types" options={programTypeOptions(group)} />
          </div>
          {loading && !managed.length ? (
            <div className="space-y-3 p-5" role="status" aria-label="Loading">
              {[0, 1, 2].map((key) => <Skeleton key={key} className="h-12 w-full" />)}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={copy.icon}
              title={inGroup.length ? 'Nothing matches this filter' : `Nothing published yet`}
              description={inGroup.length ? 'Choose another type.' : `Publish your first ${copy.noun} to reach candidates and faculty.`}
              action={!inGroup.length && <Button icon={Plus} onClick={() => setEditing('new')}>New {copy.noun}</Button>}
            />
          ) : (
            <TableShell>
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 font-medium">Title</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Starts</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Registered</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Fee</th>
                    <th scope="col" className="px-5 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((program) => (
                    <tr key={program.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{program.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{PROGRAM_TYPE_LABELS[program.type]} · {program.duration}</p>
                      </td>
                      <td className="px-3 py-3.5"><Badge tone={POSTING_STATE[program.state].tone}>{POSTING_STATE[program.state].label}</Badge></td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-slate-600">{formatDate(program.startDate)}</td>
                      <td className="px-3 py-3.5">
                        <button type="button" onClick={() => setViewing(program)} className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline">
                          <Users className="size-3.5" aria-hidden="true" />
                          {program.enrolledCount} / {program.seats}
                        </button>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">{formatFee(program.fee)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-0.5">
                          <Button variant="ghost" size="icon" icon={Pencil} onClick={() => setEditing(program)} aria-label={`Edit ${program.title}`} title="Edit" />
                          <Button variant="ghost" size="icon" icon={Trash2} onClick={() => setDeleting(program)} aria-label={`Delete ${program.title}`} title="Delete" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Card>
      )}

      {editing && <ProgramFormModal group={group} program={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {viewing && <EnrolleesModal program={viewing} onClose={() => setViewing(null)} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this listing?"
        description={deleting ? `"${deleting.title}" will be removed, along with ${deleting.enrolledCount} registration(s). Registered candidates will be notified.` : ''}
        confirmLabel="Delete"
        loading={removing}
        onConfirm={async () => {
          await remove(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
