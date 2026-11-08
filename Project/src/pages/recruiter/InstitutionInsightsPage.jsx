import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Briefcase, GraduationCap, Target, Trophy, Users } from 'lucide-react';
import { ChartCard, HorizontalBars } from '../../components/charts/Charts';
import { Avatar, Badge, Card, EmptyState, ErrorState, PageHeader, PageLoader, ProgressBar, StatCard, TableShell } from '../../components/ui/Primitives';
import { recruiterService } from '../../services/recruiterService';

const PLACEMENT = {
  PLACED: { label: 'Placed', tone: 'success' },
  IN_PROCESS: { label: 'In process', tone: 'info' },
  APPLYING: { label: 'Applying', tone: 'brand' },
  NOT_STARTED: { label: 'Not started', tone: 'neutral' },
};

export default function InstitutionInsightsPage() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ attempt: -1, data: null, error: null });

  useEffect(() => {
    let active = true;
    recruiterService.getInstitutionInsights()
      .then((data) => active && setState({ attempt, data, error: null }))
      .catch((error) => active && setState({ attempt, data: null, error: error.message }));
    return () => {
      active = false;
    };
  }, [attempt]);

  const header = <PageHeader title="Institution insights" description="Monitor your students' skill development, internship participation and placement progress." />;

  if (state.attempt !== attempt) return <PageLoader />;
  if (state.error) return <>{header}<Card><ErrorState message={state.error} onRetry={() => setAttempt((value) => value + 1)} /></Card></>;

  const { totals, students, skillDemand, rejectionGaps } = state.data;

  return (
    <div>
      {header}
      {totals.students === 0 ? (
        <Card>
          <EmptyState icon={GraduationCap} title="No students linked yet" description="Students appear here when the institution on their profile exactly matches your organization name." />
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <StatCard label="Students" value={totals.students} icon={Users} />
            <StatCard label="Average readiness" value={`${totals.averageReadiness}%`} icon={Target} />
            <StatCard label="Have verified skills" value={totals.withVerifiedSkills} icon={BadgeCheck} />
            <StatCard label="In internships" value={totals.inInternships} icon={Briefcase} />
            <div className="col-span-2 xl:col-span-1"><StatCard label="Placed" value={totals.placed} icon={Trophy} hint={`${totals.inProcess} more in process`} /></div>
          </div>

          <Card padded={false}>
            <h2 className="px-5 pt-5 pb-3 text-base font-bold sm:px-6">Student progress</h2>
            <TableShell>
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 font-medium sm:px-6">Student</th>
                    <th scope="col" className="w-48 px-3 py-2.5 font-medium">Placement readiness</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Verified skills</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Applications</th>
                    <th scope="col" className="px-5 py-2.5 font-medium sm:px-6">Placement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-5 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.fullName} size="sm" />
                          <div className="min-w-0">
                            <Link to={`/recruiter/candidates/${student.id}`} className="font-semibold text-slate-900 hover:text-brand-700">{student.fullName}</Link>
                            <p className="max-w-64 truncate text-xs text-slate-500">{student.degree}{student.graduationYear ? `, ${student.graduationYear}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <ProgressBar value={student.readiness} size="sm" label={`${student.fullName} readiness`} />
                          <span className="w-9 shrink-0 text-right tabular-nums text-slate-700">{student.readiness}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-slate-700">{student.verifiedSkills} of {student.skillCount}</td>
                      <td className="px-3 py-3 tabular-nums text-slate-700">{student.applications}</td>
                      <td className="px-5 py-3 sm:px-6"><Badge tone={PLACEMENT[student.placementStatus].tone}>{PLACEMENT[student.placementStatus].label}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </Card>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <ChartCard
              title="Industry skill demand"
              description="The skills most often required across open postings."
              table={{ columns: ['Skill', 'Open postings'], rows: skillDemand.map((row) => [row.skill, row.count]) }}
            >
              <HorizontalBars data={skillDemand} labelKey="skill" valueKey="count" name="Open postings" />
            </ChartCard>
            <ChartCard
              title="Skills missing when students were rejected"
              description="Use this to see where the curriculum may need updating."
              table={rejectionGaps.length ? { columns: ['Skill', 'Times missing'], rows: rejectionGaps.map((row) => [row.skill, row.count]) } : undefined}
            >
              {rejectionGaps.length === 0
                ? <EmptyState compact icon={Target} title="No gaps recorded" description="This fills in when students are not selected for a role." />
                : <HorizontalBars data={rejectionGaps} labelKey="skill" valueKey="count" name="Times missing" />}
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
