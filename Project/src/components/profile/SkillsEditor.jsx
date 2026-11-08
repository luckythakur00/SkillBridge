import { useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import { Code2, HeartHandshake, Plus, X } from 'lucide-react';
import Button from '../ui/Button';
import { Field } from '../ui/Form';
import { Card, SectionHeading, SkillTag } from '../ui/Primitives';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { useCandidateStore } from '../../store/candidateStore';
import { useSkillStore } from '../../store/skillStore';
import { required } from '../../utils/validators';
import { SKILL_LEVEL_LABEL, SKILL_LEVELS } from '../../constants';

const TYPE_OPTIONS = [{ value: 'TECHNICAL', label: 'Technical' }, { value: 'SOFT', label: 'Soft skill' }];

function SkillGroup({ title, icon: Icon, skills, onRemove }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Icon className="size-3.5" aria-hidden="true" />
        {title} ({skills.length})
      </h3>
      {skills.length === 0 ? (
        <p className="text-sm text-slate-500">None added yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill.name} className="inline-flex items-center">
              <SkillTag verified={skill.verified}>
                {skill.name} · {SKILL_LEVEL_LABEL[skill.level]}
                <button type="button" onClick={() => onRemove(skill.name)} aria-label={`Remove ${skill.name}`} className="-mr-0.5 ml-0.5 rounded text-slate-400 hover:text-red-600">
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </SkillTag>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SkillsEditor({ skills }) {
  const addSkill = useCandidateStore((state) => state.addSkill);
  const removeSkill = useCandidateStore((state) => state.removeSkill);
  const catalog = useSkillStore((state) => state.catalog);
  const fetchCatalog = useSkillStore((state) => state.fetchCatalog);
  const listId = useId();
  const form = useForm({ name: '', level: 'INTERMEDIATE', type: 'TECHNICAL' }, { name: [required('Skill')] });
  const [add, adding] = useAction(() => addSkill({ ...form.values, name: form.values.name.trim() }), { form });
  const [remove] = useAction((name) => removeSkill(name), { success: 'Skill removed.' });

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.validate() && (await add())) form.setValue('name', '');
  };

  const handleNameChange = (event) => {
    form.handleChange(event);
    const known = catalog.find((skill) => skill.name.toLowerCase() === event.target.value.toLowerCase());
    if (known && known.type !== 'APTITUDE') form.setValue('type', known.type);
  };

  return (
    <Card>
      <SectionHeading
        title="Skills"
        description="Add your own, or earn a verified level through an assessment."
        action={<Link to="/candidate/assessments" className="text-sm font-semibold text-brand-600 hover:underline">Verify skills</Link>}
      />
      <div className="space-y-4">
        <SkillGroup title="Technical" icon={Code2} skills={skills.filter((skill) => skill.type !== 'SOFT')} onRemove={remove} />
        <SkillGroup title="Soft skills" icon={HeartHandshake} skills={skills.filter((skill) => skill.type === 'SOFT')} onRemove={remove} />
      </div>
      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        <Field form={form} name="name" label="Add a skill" placeholder="Start typing, such as Next.js" list={listId} onChange={handleNameChange} autoComplete="off" />
        <datalist id={listId}>
          {catalog.map((skill) => <option key={skill.name} value={skill.name} />)}
        </datalist>
        <div className="grid grid-cols-2 gap-3">
          <Field form={form} as="select" name="level" label="Level" options={SKILL_LEVELS} />
          <Field form={form} as="select" name="type" label="Type" options={TYPE_OPTIONS} />
        </div>
        <Button type="submit" variant="navy" icon={Plus} loading={adding} fullWidth>Add skill</Button>
      </form>
    </Card>
  );
}
