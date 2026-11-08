import { useEffect, useMemo, useState } from 'react';
import { BarChart3, ClipboardList, Eye, Percent, Star, Trophy } from 'lucide-react';
import { ChartCard, HorizontalBars, TrendChart } from '../../components/charts/Charts';
import { Badge, Card, EmptyState, ErrorState, PageHeader, PageLoader, StatCard, TableShell, Tabs } from '../../components/ui/Primitives';
import { useRecruiterStore } from '../../store/recruiterStore';
import { APPLICATION_STATUS, POSTING_STATE } from '../../constants';
import { formatDate } from '../../utils/format';

const PERFORMANCE_TABS = [
  { value: 'JOB', label: 'Job performance' },
  { value: 'INTERNSHIP', label: 'Internship performance' },
];

export default function AnalyticsPage() {
  const analytics = useRecruiterStore((state) => state.analytics);
  const loading = useRecruiterStore((state) => state.loading.analytics);
  const error = useRecruiterStore((state) => state.errors.analytics);
  const fetchAnalytics = useRecruiterStore((state) => state.fetchAnalytics);
  const [tab, setTab] = useState('JOB');

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const weeks = useMemo(
    () => (analytics?.trend ?? []).map((entry) => ({ week: formatDate(entry.weekEnding, { day: 'numeric', month: 'short' }), applications: entry.applications })),
    [analytics],
  );
  const statuses = useMemo(
    () => (analytics?.statusDistribution ?? []).map((entry) => ({ status: APPLICATION_STATUS[entry.status].label, count: entry.count })),
    [analytics],
  );

  if (error && !analytics) return <Card><ErrorState message={error} onRetry={fetchAnalytics} /></Card>;
  if (loading && !analytics) return <PageLoader />;
  if (!analytics) return null;

  const { totals, skillDistribution, performance } = analytics;
  const selectionRate = totals.applications ? Math.round((totals.selected / totals.applications) * 100) : 0;
  const rows = performance.filter((posting) => posting.type === tab);

  return (
    <div>
      <PageHeader title="Recruitment analytics" description="Understand your pipeline, your applicants' skills and how each posting performs." />

      {totals.applications === 0 ? (
        <Card><EmptyState icon={BarChart3} title="No data yet" description="Charts will appear once candidates start applying to your postings." /></Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Total applications" value={totals.applications} icon={ClipboardList} />
            <StatCard label="In shortlist or interview" value={totals.shortlisted} icon={Star} />
            <StatCard label="Candidates selected" value={totals.selected} icon={Trophy} hint={`${selectionRate}% of applications`} />
            <StatCard label="Posting views" value={totals.views.toLocaleString('en-IN')} icon={Eye} />
          </div>

          <ChartCard
            title="Recruitment trend"
            description="Applications received per week, for the last eight weeks."
            table={{ columns: ['Week ending', 'Applications'], rows: weeks.map((row) => [row.week, row.applications]) }}
          >
            <TrendChart data={weeks} xKey="week" yKey="applications" name="Applications" />
          </ChartCard>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <ChartCard
              title="Application status"
              description="Where all your applications currently stand."
              table={{ columns: ['Status', 'Applications'], rows: statuses.map((row) => [row.status, row.count]) }}
            >
              <HorizontalBars data={statuses} labelKey="status" valueKey="count" name="Applications" />
            </ChartCard>
            <ChartCard
              title="Applicant skills"
              description="The most common skills among your applicants."
              table={{ columns: ['Skill', 'Applicants'], rows: skillDistribution.map((row) => [row.skill, row.count]) }}
            >
              <HorizontalBars data={skillDistribution} labelKey="skill" valueKey="count" name="Applicants" />
            </ChartCard>
          </div>

          <Card>
            <Tabs tabs={PERFORMANCE_TABS} active={tab} onChange={setTab} label="Posting type" />
            {rows.length === 0 ? (
              <EmptyState compact icon={Percent} title="No postings of this type" />
            ) : (
              <TableShell>
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs text-slate-500">
                    <tr>
                      <th scope="col" className="py-2.5 pr-3 font-medium">Posting</th>
                      <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                      <th scope="col" className="px-3 py-2.5 text-right font-medium">Views</th>
                      <th scope="col" className="px-3 py-2.5 text-right font-medium">Applications</th>
                      <th scope="col" className="px-3 py-2.5 text-right font-medium">Shortlisted</th>
                      <th scope="col" className="px-3 py-2.5 text-right font-medium">Selected</th>
                      <th scope="col" className="py-2.5 pl-3 text-right font-medium">Views to apply</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 pr-3 font-medium text-slate-900">{row.title}</td>
                        <td className="px-3 py-3"><Badge tone={POSTING_STATE[row.state].tone}>{POSTING_STATE[row.state].label}</Badge></td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-700">{row.views.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-700">{row.applications}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-700">{row.shortlisted}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-700">{row.selected}</td>
                        <td className="py-3 pl-3 text-right tabular-nums text-slate-700">{row.views ? `${((row.applications / row.views) * 100).toFixed(1)}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
