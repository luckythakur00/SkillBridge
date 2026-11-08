import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Briefcase, ClipboardList, GraduationCap, Plus, Search, Star, Library } from 'lucide-react';
import { StatusBadge } from '../../components/applications/ApplicationParts';
import { MatchBadge } from '../../components/opportunities/OpportunityCard';
import { ChartCard, TrendChart } from '../../components/charts/Charts';
import Button from '../../components/ui/Button';
import { Avatar, Card, EmptyState, ErrorState, PageLoader, SectionHeading, StatCard } from '../../components/ui/Primitives';
import { useAuthStore } from '../../store/authStore';
import { useRecruiterStore } from '../../store/recruiterStore';
import { formatDate, timeAgo } from '../../utils/format';

const QUICK_ACTIONS = [
  { label: 'Post a job', to: '/recruiter/jobs/new', icon: Briefcase },
  { label: 'Post an internship', to: '/recruiter/internships/new', icon: GraduationCap },
  { label: 'Search candidates', to: '/recruiter/candidates', icon: Search },
  { label: 'Add a program', to: '/recruiter/programs', icon: Library },
];

const trendRows = (trend) =>
  trend.map((entry) => ({ week: formatDate(entry.weekEnding, { day: 'numeric', month: 'short' }), applications: entry.applications }));

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const analytics = useRecruiterStore((state) => state.analytics);
  const loading = useRecruiterStore((state) => state.loading.analytics);
  const error = useRecruiterStore((state) => state.errors.analytics);
  const fetchAnalytics = useRecruiterStore((state) => state.fetchAnalytics);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (error && !analytics) return <Card><ErrorState message={error} onRetry={fetchAnalytics} /></Card>;
  if (loading && !analytics) return <PageLoader />;
  if (!analytics) return null;

  const { totals, recent, trend } = analytics;
  const weeks = trendRows(trend);
  const hasPostings = totals.activeJobs + totals.activeInternships + totals.expiredPostings > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{user.organizationName}</h1>
          <p className="mt-1 text-sm text-slate-500">Your recruitment activity at a glance.</p>
        </div>
        <Button to="/recruiter/jobs/new" icon={Plus}>New posting</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Active jobs" value={totals.activeJobs} icon={Briefcase} to="/recruiter/jobs" />
        <StatCard label="Active internships" value={totals.activeInternships} icon={GraduationCap} to="/recruiter/internships" />
        <StatCard label="Applications received" value={totals.applications} icon={ClipboardList} to="/recruiter/applications" />
        <StatCard label="Shortlisted candidates" value={totals.shortlisted} icon={Star} to="/recruiter/applications" />
      </div>

      {!hasPostings && (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="Publish your first opportunity"
            description="Once you post a job or internship, matching candidates can find it and apply."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button to="/recruiter/jobs/new">Post a job</Button>
                <Button to="/recruiter/organization" variant="secondary">Complete organization profile</Button>
              </div>
            }
          />
        </Card>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionHeading
              title="Recent applications"
              action={<Link to="/recruiter/applications" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">View all<ArrowRight className="size-3.5" aria-hidden="true" /></Link>}
            />
            {recent.length === 0 ? (
              <EmptyState compact icon={ClipboardList} title="No applications yet" description="New applicants will appear here." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((application) => (
                  <li key={application.id}>
                    <Link to={`/recruiter/candidates/${application.candidateId}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50">
                      <Avatar name={application.candidate?.fullName} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{application.candidate?.fullName}</p>
                        <p className="truncate text-xs text-slate-500">{application.opportunity?.title} · {timeAgo(application.appliedAt)}</p>
                      </div>
                      <span className="hidden md:block"><MatchBadge score={application.matchScore} /></span>
                      <StatusBadge status={application.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <ChartCard
            title="Applications per week"
            description="The last eight weeks."
            table={{ columns: ['Week ending', 'Applications'], rows: weeks.map((row) => [row.week, row.applications]) }}
          >
            <TrendChart data={weeks} xKey="week" yKey="applications" name="Applications" />
          </ChartCard>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionHeading title="Quick actions" />
            <ul className="space-y-1">
              {QUICK_ACTIONS.map(({ label, to, icon: Icon }) => (
                <li key={to}>
                  <Link to={to} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon className="size-4" aria-hidden="true" /></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <SectionHeading title="Hiring outcomes" icon={BarChart3} action={<Link to="/recruiter/analytics" className="text-sm font-semibold text-brand-600 hover:underline">Analytics</Link>} />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-600">Candidates selected</dt><dd className="font-semibold text-slate-900">{totals.selected}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-600">Posting views</dt><dd className="font-semibold text-slate-900">{totals.views.toLocaleString('en-IN')}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-600">Expired postings</dt><dd className="font-semibold text-slate-900">{totals.expiredPostings}</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
