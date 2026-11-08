import { useEffect, useMemo, useState } from 'react';
import { Award, BadgeCheck, Clock, HelpCircle, History } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Badge, Card, CardGridSkeleton, EmptyState, ErrorState, PageHeader, StatCard, TableShell, Tabs } from '../../components/ui/Primitives';
import { useSkillStore } from '../../store/skillStore';
import { ASSESSMENT_KIND_LABELS, SKILL_LEVEL_LABEL } from '../../constants';
import { formatDate, pluralize } from '../../utils/format';

const TABS = ['ALL', 'TECHNICAL', 'SOFT', 'APTITUDE'];

function AssessmentCard({ assessment, latest }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Badge tone="brand">{ASSESSMENT_KIND_LABELS[assessment.kind]}</Badge>
        {latest && latest.score >= 50 && <Badge tone="success" icon={BadgeCheck}>Verified</Badge>}
      </div>
      <h3 className="mt-3 text-[15px] font-bold">{assessment.title}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-600">{assessment.description}</p>
      <ul className="mt-3 flex gap-4 text-sm text-slate-500">
        <li className="flex items-center gap-1.5"><HelpCircle className="size-4" aria-hidden="true" />{pluralize(assessment.questionCount, 'question')}</li>
        <li className="flex items-center gap-1.5"><Clock className="size-4" aria-hidden="true" />{assessment.durationMinutes} min</li>
      </ul>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-600">
          {latest ? <>Latest: <span className="font-semibold text-slate-900">{latest.score}%</span></> : 'Not taken yet'}
        </p>
        <Button to={`/candidate/assessments/${assessment.id}`} variant={latest ? 'secondary' : 'primary'} size="sm">{latest ? 'Retake' : 'Start'}</Button>
      </div>
    </article>
  );
}

export default function AssessmentsPage() {
  const assessments = useSkillStore((state) => state.assessments);
  const results = useSkillStore((state) => state.results);
  const loading = useSkillStore((state) => state.loading.assessments);
  const error = useSkillStore((state) => state.errors.assessments);
  const fetchAssessments = useSkillStore((state) => state.fetchAssessments);
  const fetchResults = useSkillStore((state) => state.fetchResults);
  const [tab, setTab] = useState('ALL');

  useEffect(() => {
    fetchAssessments();
    fetchResults();
  }, [fetchAssessments, fetchResults]);

  const latestByAssessment = useMemo(() => {
    const map = new Map();
    results.forEach((result) => {
      if (!map.has(result.assessmentId)) map.set(result.assessmentId, result);
    });
    return map;
  }, [results]);

  const visible = assessments.filter((assessment) => tab === 'ALL' || assessment.kind === tab);
  const passed = [...latestByAssessment.values()].filter((result) => result.score >= 50).length;
  const average = results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0;
  const tabs = TABS.map((value) => ({
    value,
    label: value === 'ALL' ? 'All' : ASSESSMENT_KIND_LABELS[value],
    count: value === 'ALL' ? assessments.length : assessments.filter((assessment) => assessment.kind === value).length,
  }));

  return (
    <div>
      <PageHeader title="Skill assessments" description="Score 50% or higher to add a verified skill level to your profile. A higher score earns a higher level." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Assessments passed" value={passed} icon={BadgeCheck} />
        <StatCard label="Attempts" value={results.length} icon={History} />
        <div className="col-span-2 lg:col-span-1"><StatCard label="Average score" value={results.length ? `${average}%` : '—'} icon={Award} /></div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} label="Assessment type" />

      {error && <Card><ErrorState message={error} onRetry={fetchAssessments} /></Card>}
      {!error && loading && !assessments.length && <CardGridSkeleton />}
      {!error && visible.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((assessment) => <AssessmentCard key={assessment.id} assessment={assessment} latest={latestByAssessment.get(assessment.id)} />)}
        </div>
      )}

      <Card className="mt-6" padded={false}>
        <h2 className="flex items-center gap-2 px-5 pt-5 pb-3 text-base font-bold sm:px-6"><History className="size-4 text-brand-600" aria-hidden="true" />Assessment history</h2>
        {results.length === 0 ? (
          <EmptyState compact icon={History} title="No attempts yet" description="Your scores and proficiency levels will be listed here." />
        ) : (
          <TableShell>
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-2.5 font-medium sm:px-6">Assessment</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Type</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Score</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Level</th>
                  <th scope="col" className="px-5 py-2.5 font-medium sm:px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((result) => (
                  <tr key={result.id}>
                    <td className="px-5 py-3 font-medium text-slate-900 sm:px-6">{result.assessmentTitle}</td>
                    <td className="px-3 py-3 text-slate-600">{ASSESSMENT_KIND_LABELS[result.kind] ?? '—'}</td>
                    <td className="px-3 py-3 text-slate-900">{result.score}%</td>
                    <td className="px-3 py-3">{result.score >= 50 ? <Badge tone="brand">{SKILL_LEVEL_LABEL[result.level]}</Badge> : <Badge>Not passed</Badge>}</td>
                    <td className="px-5 py-3 text-slate-600 sm:px-6">{formatDate(result.takenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        )}
      </Card>
    </div>
  );
}
