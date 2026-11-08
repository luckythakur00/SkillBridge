import { useEffect, useId, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Save, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Field, FormField } from '../../components/ui/Form';
import { Card, EmptyState, ErrorState, PageHeader, PageLoader, SectionHeading } from '../../components/ui/Primitives';
import { useJobStore } from '../../store/jobStore';
import { useSkillStore } from '../../store/skillStore';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { futureDate, numberRange, required } from '../../utils/validators';
import { toDateInput } from '../../utils/format';
import { CURRENCIES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, PAY_PERIODS, SKILL_LEVELS, WORK_MODES } from '../../constants';

const COPY = {
  JOB: { noun: 'job', path: '/recruiter/jobs', payLabel: 'Salary' },
  INTERNSHIP: { noun: 'internship', path: '/recruiter/internships', payLabel: 'Stipend' },
};
const SKILL_TYPES = [{ value: 'TECHNICAL', label: 'Technical' }, { value: 'SOFT', label: 'Soft skill' }];

const toLines = (list) => (list ?? []).join('\n');
const fromLines = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean);

const blankValues = (type) => ({
  title: '',
  description: '',
  responsibilities: '',
  qualifications: '',
  eligibility: '',
  location: '',
  workMode: 'HYBRID',
  employmentType: 'FULL_TIME',
  durationMonths: type === 'INTERNSHIP' ? 3 : '',
  experienceLevel: 'FRESHER',
  currency: 'INR',
  payMin: '',
  payMax: '',
  payPeriod: type === 'JOB' ? 'YEAR' : 'MONTH',
  openings: 1,
  deadline: '',
});

const valuesFromPosting = (posting) => ({
  title: posting.title,
  description: posting.description,
  responsibilities: toLines(posting.responsibilities),
  qualifications: toLines(posting.qualifications),
  eligibility: posting.eligibility ?? '',
  location: posting.location,
  workMode: posting.workMode,
  employmentType: posting.employmentType ?? 'FULL_TIME',
  durationMonths: posting.durationMonths ?? '',
  experienceLevel: posting.experienceLevel,
  currency: posting.compensation?.currency ?? 'INR',
  payMin: posting.compensation?.min ?? '',
  payMax: posting.compensation?.max ?? '',
  payPeriod: posting.compensation?.period ?? 'MONTH',
  openings: posting.openings,
  deadline: toDateInput(posting.deadline),
});

function SkillRequirements({ skills, onChange, error }) {
  const catalog = useSkillStore((state) => state.catalog);
  const fetchCatalog = useSkillStore((state) => state.fetchCatalog);
  const listId = useId();

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const update = (index, changes) => onChange(skills.map((skill, position) => (position === index ? { ...skill, ...changes } : skill)));
  const updateName = (index, name) => {
    const known = catalog.find((skill) => skill.name.toLowerCase() === name.toLowerCase());
    update(index, { name, ...(known && known.type !== 'APTITUDE' ? { type: known.type } : {}) });
  };

  return (
    <FormField id="skills" error={error}>
      <datalist id={listId}>{catalog.map((skill) => <option key={skill.name} value={skill.name} />)}</datalist>
      <ul className="space-y-2">
        {skills.map((skill, index) => (
          <li key={skill.key} className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border border-slate-200 p-2.5 sm:grid-cols-[minmax(0,1fr)_9rem_9rem_auto] sm:border-0 sm:p-0">
            <input
              aria-label={`Skill ${index + 1} name`}
              list={listId}
              value={skill.name}
              onChange={(event) => updateName(index, event.target.value)}
              placeholder="Skill name"
              autoComplete="off"
              className="input-base"
            />
            <select aria-label={`Skill ${index + 1} level`} value={skill.level} onChange={(event) => update(index, { level: event.target.value })} className="input-base col-start-1 sm:col-start-auto">
              {SKILL_LEVELS.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
            </select>
            <select aria-label={`Skill ${index + 1} type`} value={skill.type} onChange={(event) => update(index, { type: event.target.value })} className="input-base col-start-1 sm:col-start-auto">
              {SKILL_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <div className="col-start-2 row-span-3 row-start-1 sm:col-start-auto sm:row-span-1 sm:row-start-auto">
              <Button variant="ghost" size="icon" icon={Trash2} aria-label={`Remove skill ${index + 1}`} onClick={() => onChange(skills.filter((_, position) => position !== index))} />
            </div>
          </li>
        ))}
      </ul>
      <Button
        variant="secondary"
        size="sm"
        icon={Plus}
        className="mt-3"
        onClick={() => onChange([...skills, { key: `new-${Date.now()}`, name: '', level: 'INTERMEDIATE', type: 'TECHNICAL' }])}
      >
        Add skill
      </Button>
    </FormField>
  );
}

function PostingForm({ type, posting }) {
  const copy = COPY[type];
  const navigate = useNavigate();
  const createPosting = useJobStore((state) => state.createPosting);
  const updatePosting = useJobStore((state) => state.updatePosting);
  const isEditing = Boolean(posting);
  const [skills, setSkills] = useState(() =>
    (posting?.requiredSkills ?? [{ name: '', level: 'INTERMEDIATE', type: 'TECHNICAL' }]).map((skill, index) => ({ ...skill, key: `skill-${index}` })),
  );
  const [skillsError, setSkillsError] = useState('');
  const form = useForm(posting ? valuesFromPosting(posting) : blankValues(type));
  const { values } = form;

  const schema = useMemo(() => ({
    title: [required('Title')],
    description: [required('Description')],
    eligibility: [required('Eligibility')],
    location: [required('Location')],
    openings: [required('Openings'), numberRange(1, 1000, 'Openings')],
    ...(type === 'INTERNSHIP' ? { durationMonths: [required('Duration'), numberRange(1, 24, 'Duration')] } : {}),
    payMin: [numberRange(0, 100000000, 'Minimum pay')],
    payMax: [
      numberRange(0, 100000000, 'Maximum pay'),
      (value, all) => (value && all.payMin && Number(value) < Number(all.payMin) ? 'Maximum cannot be lower than minimum.' : ''),
    ],
    // A posting being edited may keep a past deadline only if it is unchanged.
    deadline: [required('Deadline'), ...(posting && toDateInput(posting.deadline) === values.deadline ? [] : [futureDate('Deadline')])],
  }), [type, posting, values.deadline]);

  const [save, saving] = useAction(
    (payload) => (isEditing ? updatePosting(posting.id, payload) : createPosting(payload)),
    { success: isEditing ? 'Posting updated.' : `Your ${copy.noun} is now live.`, form },
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const requiredSkills = skills
      .map(({ name, level, type: skillType }) => ({ name: name.trim(), level, type: skillType }))
      .filter((skill) => skill.name);
    const names = requiredSkills.map((skill) => skill.name.toLowerCase());
    const duplicate = new Set(names).size !== names.length;
    const skillProblem = !requiredSkills.length ? 'Add at least one required skill.' : duplicate ? 'Each skill can only be listed once.' : '';
    setSkillsError(skillProblem);
    if (!form.validate(schema) || skillProblem) return;

    const hasPay = values.payMin || values.payMax;
    const saved = await save({
      type,
      title: values.title.trim(),
      description: values.description.trim(),
      responsibilities: fromLines(values.responsibilities),
      qualifications: fromLines(values.qualifications),
      eligibility: values.eligibility.trim(),
      requiredSkills,
      location: values.location.trim(),
      workMode: values.workMode,
      employmentType: type === 'JOB' ? values.employmentType : null,
      durationMonths: type === 'INTERNSHIP' ? Number(values.durationMonths) : null,
      experienceLevel: values.experienceLevel,
      compensation: hasPay
        ? { min: Number(values.payMin) || null, max: Number(values.payMax) || null, currency: values.currency, period: values.payPeriod }
        : null,
      openings: Number(values.openings),
      deadline: new Date(`${values.deadline}T23:59:59`).toISOString(),
    });
    if (saved) navigate(copy.path);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card>
        <SectionHeading title="Role details" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field form={form} name="title" label="Title" required placeholder={type === 'JOB' ? 'Backend Engineer' : 'Data Analytics Intern'} className="sm:col-span-2" />
          <Field form={form} as="textarea" rows={5} name="description" label="Description" required placeholder="Describe the work, team and what someone will learn." className="sm:col-span-2" />
          <Field form={form} as="textarea" name="responsibilities" label="Responsibilities" hint="One per line." className="sm:col-span-2" />
          <Field form={form} name="location" label="Location" required placeholder="City, Country" />
          <Field form={form} as="select" name="workMode" label="Work mode" options={WORK_MODES} />
          {type === 'JOB'
            ? <Field form={form} as="select" name="employmentType" label="Employment type" options={EMPLOYMENT_TYPES} />
            : <Field form={form} name="durationMonths" type="number" min="1" label="Duration (months)" required />}
          <Field form={form} name="openings" type="number" min="1" label="Openings" required />
        </div>
      </Card>

      <Card>
        <SectionHeading title="Eligibility and qualifications" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field form={form} as="textarea" rows={3} name="eligibility" label="Eligibility" required placeholder="Who can apply?" className="sm:col-span-2" />
          <Field form={form} as="textarea" rows={3} name="qualifications" label="Qualifications" hint="One per line." className="sm:col-span-2" />
          <Field form={form} as="select" name="experienceLevel" label="Experience required" options={EXPERIENCE_LEVELS} />
        </div>
      </Card>

      <Card>
        <SectionHeading title="Required skills" description="Candidates are matched and ranked against these skills and levels." />
        <SkillRequirements skills={skills} onChange={(next) => { setSkills(next); setSkillsError(''); }} error={skillsError} />
      </Card>

      <Card>
        <SectionHeading title={`${copy.payLabel} and deadline`} description="Leave pay blank if the position is unpaid." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field form={form} as="select" name="currency" label="Currency" options={CURRENCIES} />
          <Field form={form} name="payMin" type="number" min="0" label="Minimum" />
          <Field form={form} name="payMax" type="number" min="0" label="Maximum" />
          <Field form={form} as="select" name="payPeriod" label="Paid" options={PAY_PERIODS} />
          <Field form={form} name="deadline" type="date" label="Application deadline" required />
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" to={copy.path}>Cancel</Button>
        <Button type="submit" icon={Save} loading={saving}>{isEditing ? 'Save changes' : `Publish ${copy.noun}`}</Button>
      </div>
    </form>
  );
}

export default function PostingFormPage({ type }) {
  const { id } = useParams();
  const copy = COPY[type];
  const postings = useJobStore((state) => state.postings);
  const loading = useJobStore((state) => state.loading.postings);
  const error = useJobStore((state) => state.errors.postings);
  const fetchPostings = useJobStore((state) => state.fetchPostings);
  const [loaded, setLoaded] = useState(!id);

  useEffect(() => {
    if (id) fetchPostings().finally(() => setLoaded(true));
  }, [id, fetchPostings]);

  const posting = id ? postings.find((entry) => entry.id === id && entry.type === type) : null;
  const header = (
    <PageHeader
      title={id ? `Edit ${copy.noun}` : `New ${copy.noun}`}
      description={id ? posting?.title : 'Publishing makes this visible to candidates immediately.'}
      backTo={copy.path}
      backLabel={`Back to ${copy.noun}s`}
    />
  );

  if (error) return <>{header}<Card><ErrorState message={error} onRetry={fetchPostings} /></Card></>;
  if (!loaded || (loading && id && !posting)) return <PageLoader />;
  if (id && !posting) {
    return (
      <>
        {header}
        <Card><EmptyState title="Posting not found" description="It may have been deleted, or it may belong to another organization." action={<Button to={copy.path} variant="secondary">Back to {copy.noun}s</Button>} /></Card>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {header}
      <PostingForm key={id ?? 'new'} type={type} posting={posting} />
    </div>
  );
}
