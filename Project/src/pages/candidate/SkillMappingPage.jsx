import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Award, BookOpen, Briefcase, CheckCircle2, CircleDashed, Target, TrendingUp, XCircle } from 'lucide-react';
import { ChartCard, SkillGapChart } from '../../components/charts/Charts';
import { SkillsByLevel } from '../../components/profile/PortfolioView';
import { MatchBadge } from '../../components/opportunities/OpportunityCard';
import Button from '../../components/ui/Button';
import { Card, EmptyState, ErrorState, PageHeader, PageLoader, ProgressBar, SectionHeading, SkillTag } from '../../components/ui/Primitives';
import { useSkillStore } from '../../store/skillStore';
import { PROGRAM_TYPE_LABELS, SKILL_LEVEL_LABEL, SKILL_LEVEL_RANK, SKILL_LEVELS } from '../../constants';
import { formatFee } from '../../utils/format';

function buildGapRows(path) {
  const row = (skill, current) => ({
    skill: skill.name,
    current,
    required: SKILL_LEVEL_RANK[skill.level],
  });
  return [
    ...path.missing.map((skill) => row(skill, 0)),
    ...path.partial.map((skill) => row(skill, SKILL_LEVEL_RANK[skill.currentLevel])),
    ...path.matched.map((skill) => row(skill, SKILL_LEVEL_RANK[skill.currentLevel])),
  ];
}

function PathButton({ path, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${selected ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-slate-900">{path.title}</span>
        <span className="font-semibold text-slate-700">{path.readiness}%</span>
      </div>
      <div className="mt-2"><ProgressBar value={path.readiness} size="sm" label={`${path.title} readiness`} /></div>
    </button>
  );
}

function GapGroup({ title, icon: Icon, color, skills, emptyText, levelFormat }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
        <Icon className={`size-4 ${color}`} aria-hidden="true" />
        {title} ({skills.length})
      </h3>
      {skills.length === 0 ? <p className="text-sm text-slate-500">{emptyText}</p> : (
        <ul className="flex flex-wrap gap-1.5">
          {skills.map((skill) => <li key={skill.name}><SkillTag verified={skill.verified}>{levelFormat(skill)}</SkillTag></li>)}
        </ul>
      )}
    </div>
  );
}

export default function SkillMappingPage() {
  const mapping = useSkillStore((state) => state.mapping);
  const loading = useSkillStore((state) => state.loading.mapping);
  const error = useSkillStore((state) => state.errors.mapping);
  const fetchMapping = useSkillStore((state) => state.fetchMapping);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchMapping();
  }, [fetchMapping]);

  const path = useMemo(() => {
    if (!mapping) return null;
    return mapping.paths.find((entry) => entry.id === selectedId) ?? mapping.paths[0];
  }, [mapping, selectedId]);
  const gapRows = useMemo(() => (path ? buildGapRows(path) : []), [path]);

  if (error && !mapping) return <Card><ErrorState message={error} onRetry={fetchMapping} /></Card>;
  if (loading && !mapping) return <PageLoader />;
  if (!mapping || !path) return null;

  const levelName = (rank) => SKILL_LEVELS.find((level) => level.rank === rank)?.label ?? 'Not yet';

  return (
    <div>
      <PageHeader title="Skill mapping" description="See how your skills compare with what industry roles require, and what to learn next." />

      {mapping.skills.length === 0 && (
        <Card className="mb-6">
          <EmptyState icon={Target} title="Add skills to see your map" description="Your readiness scores will update as you add skills and pass assessments." action={<Button to="/candidate/profile">Add skills</Button>} />
        </Card>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <SectionHeading title="Suggested career paths" description="Ranked by your readiness." />
            <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
              {mapping.paths.map((entry) => (
                <PathButton key={entry.id} path={entry} selected={entry.id === path.id} onSelect={() => setSelectedId(entry.id)} />
              ))}
            </div>
          </Card>
          <Card>
            <SectionHeading title="Your current skills" action={<Link to="/candidate/assessments" className="text-sm font-semibold text-brand-600 hover:underline">Verify</Link>} />
            <SkillsByLevel skills={mapping.skills} />
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold">{path.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{path.description}</p>
              </div>
              <div className="sm:text-right">
                <p className="font-display text-3xl font-bold text-navy-900">{path.readiness}%</p>
                <p className="text-xs text-slate-500">ready</p>
              </div>
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <li className="flex items-center gap-1.5"><TrendingUp className="size-4 text-slate-400" aria-hidden="true" />Later roles: {path.nextRoles.join(', ')}</li>
              <li className="flex items-center gap-1.5"><Award className="size-4 text-slate-400" aria-hidden="true" />{path.salaryBand}</li>
            </ul>
          </Card>

          <ChartCard
            title="Your level compared with the requirement"
            description="Skills you have not added yet appear at the top, with no blue bar."
            table={{
              columns: ['Skill', 'Your level', 'Required'],
              rows: gapRows.map((row) => [row.skill, levelName(row.current), levelName(row.required)]),
            }}
          >
            <SkillGapChart data={gapRows} />
          </ChartCard>

          <Card>
            <SectionHeading title="Skill gap breakdown" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <GapGroup title="Missing" icon={XCircle} color="text-red-500" skills={path.missing} emptyText="No missing skills." levelFormat={(skill) => skill.name} />
              <GapGroup title="To improve" icon={CircleDashed} color="text-amber-600" skills={path.partial} emptyText="Nothing to improve." levelFormat={(skill) => `${skill.name}: ${SKILL_LEVEL_LABEL[skill.currentLevel]} → ${SKILL_LEVEL_LABEL[skill.level]}`} />
              <GapGroup title="Requirement met" icon={CheckCircle2} color="text-emerald-600" skills={path.matched} emptyText="None yet." levelFormat={(skill) => skill.name} />
            </div>
          </Card>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
            <Card>
              <SectionHeading title="Recommended learning" icon={BookOpen} />
              {path.recommendedPrograms.length === 0 ? <p className="text-sm text-slate-500">No programs cover these gaps right now.</p> : (
                <ul className="space-y-3">
                  {path.recommendedPrograms.map((program) => (
                    <li key={program.id}>
                      <Link to="/candidate/learning" className="group block rounded-lg border border-slate-200 p-3 transition-colors hover:border-brand-300">
                        <p className="flex items-start justify-between gap-2 text-sm font-semibold text-slate-900">
                          {program.title}
                          <ArrowUpRight className="size-4 shrink-0 text-slate-400 group-hover:text-brand-600" aria-hidden="true" />
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{PROGRAM_TYPE_LABELS[program.type]} · {program.duration} · {formatFee(program.fee)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <SectionHeading title="Roles open now" icon={Briefcase} />
              {path.matchingOpportunities.length === 0 ? <p className="text-sm text-slate-500">No open roles use these skills right now.</p> : (
                <ul className="space-y-3">
                  {path.matchingOpportunities.map((opportunity) => (
                    <li key={opportunity.id}>
                      <Link to={`/candidate/opportunities/${opportunity.id}`} className="block rounded-lg border border-slate-200 p-3 transition-colors hover:border-brand-300">
                        <p className="text-sm font-semibold text-slate-900">{opportunity.title}</p>
                        <p className="mt-0.5 mb-2 text-xs text-slate-500">{opportunity.organization?.name}</p>
                        <MatchBadge score={opportunity.matchScore} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
