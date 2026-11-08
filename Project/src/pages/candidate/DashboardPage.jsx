import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BadgeCheck, BookOpen, Briefcase, CalendarDays, Circle, ClipboardList, Target, UserRound } from 'lucide-react';
import { StatusBadge } from '../../components/applications/ApplicationParts';
import { MatchBadge } from '../../components/opportunities/OpportunityCard';
import Button from '../../components/ui/Button';
import { Badge, Card, EmptyState, OrgLogo, ProgressBar, SectionHeading, Skeleton, StatCard } from '../../components/ui/Primitives';
import { useAuthStore } from '../../store/authStore';
import { useCandidateStore } from '../../store/candidateStore';
import { useJobStore } from '../../store/jobStore';
import { useApplicationStore } from '../../store/applicationStore';
import { useSkillStore } from '../../store/skillStore';
import { useTrainingStore } from '../../store/trainingStore';
import { profileChecklist, profileCompletion } from '../../utils/skillMatch';
import { OPPORTUNITY_TYPE_LABELS, PROGRAM_TYPE_LABELS, SKILL_LEVEL_LABEL } from '../../constants';
import { formatCompensation, formatDate, timeAgo } from '../../utils/format';

const ACTIVE_STATUSES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW'];

const LinkAction = ({ to, children }) => (
  <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
    {children}
    <ArrowRight className="size-3.5" aria-hidden="true" />
  </Link>
);

const ListSkeleton = () => (
  <div className="space-y-3" role="status" aria-label="Loading">
    {[0, 1, 2].map((key) => <Skeleton key={key} className="h-12 w-full" />)}
  </div>
);

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const profile = useCandidateStore((state) => state.profile);
  const fetchProfile = useCandidateStore((state) => state.fetchProfile);
  const recommended = useJobStore((state) => state.recommended);
  const recommendedLoading = useJobStore((state) => state.loading.recommended);
  const fetchRecommended = useJobStore((state) => state.fetchRecommended);
  const applications = useApplicationStore((state) => state.mine);
  const applicationsLoading = useApplicationStore((state) => state.loading.mine);
  const fetchApplications = useApplicationStore((state) => state.fetchMine);
  const results = useSkillStore((state) => state.results);
  const fetchResults = useSkillStore((state) => state.fetchResults);
  const mapping = useSkillStore((state) => state.mapping);
  const fetchMapping = useSkillStore((state) => state.fetchMapping);
  const enrollments = useTrainingStore((state) => state.enrollments);
  const fetchEnrollments = useTrainingStore((state) => state.fetchEnrollments);

  useEffect(() => {
    fetchProfile();
    fetchRecommended();
    fetchApplications();
    fetchResults();
    fetchMapping();
    fetchEnrollments();
  }, [fetchProfile, fetchRecommended, fetchApplications, fetchResults, fetchMapping, fetchEnrollments]);

  const activeCount = useMemo(() => applications.filter((a) => ACTIVE_STATUSES.includes(a.status)).length, [applications]);
  const verifiedCount = profile?.skills.filter((skill) => skill.verified).length ?? 0;
  const completion = profile ? profileCompletion(profile) : 0;
  const remaining = profile ? profileChecklist(profile).filter((item) => !item.done).slice(0, 3) : [];
  const nextInterview = applications.find((a) => a.interview && a.status === 'INTERVIEW');
  const topPath = mapping?.paths[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name.replace(/^(Dr|Prof)\.?\s+/i, '').split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500">Here is where your skills and applications stand today.</p>
        </div>
        <Button to="/candidate/opportunities" icon={Briefcase}>Find opportunities</Button>
      </div>

      {nextInterview && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-start gap-2.5 text-sm text-slate-800">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
            <span><strong className="font-semibold">Upcoming interview:</strong> {nextInterview.opportunity?.title}, {formatDate(nextInterview.interview.scheduledAt)}</span>
          </p>
          <LinkAction to="/candidate/applications">View details</LinkAction>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Profile completion" value={`${completion}%`} icon={UserRound} to="/candidate/profile" />
        <StatCard label="Verified skills" value={verifiedCount} icon={BadgeCheck} to="/candidate/assessments" />
        <StatCard label="Active applications" value={activeCount} icon={ClipboardList} to="/candidate/applications" />
        <StatCard label="Programs joined" value={enrollments.length} icon={BookOpen} to="/candidate/learning" />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionHeading
              title="Recommended for you"
              description="Ranked by how well your skills match."
              action={<LinkAction to="/candidate/opportunities?sort=match">View all</LinkAction>}
            />
            {recommendedLoading && !recommended.length ? <ListSkeleton /> : recommended.length === 0 ? (
              <EmptyState compact icon={Briefcase} title="No recommendations yet" description="Add skills to your profile to get matched with opportunities." action={<Button to="/candidate/profile" variant="secondary">Add skills</Button>} />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recommended.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <Link to={`/candidate/opportunities/${item.id}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50">
                      <OrgLogo organization={item.organization} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="truncate text-xs text-slate-500">{item.organization?.name} · {OPPORTUNITY_TYPE_LABELS[item.type]} · {formatCompensation(item.compensation)}</p>
                      </div>
                      <span className="hidden sm:block"><MatchBadge score={item.matchScore} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeading title="Recent applications" action={<LinkAction to="/candidate/applications">View all</LinkAction>} />
            {applicationsLoading && !applications.length ? <ListSkeleton /> : applications.length === 0 ? (
              <EmptyState compact icon={ClipboardList} title="No applications yet" description="Your applications and their progress will appear here." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {applications.slice(0, 4).map((application) => (
                  <li key={application.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <OrgLogo organization={application.opportunity?.organization} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{application.opportunity?.title}</p>
                      <p className="text-xs text-slate-500">Applied {timeAgo(application.appliedAt)}</p>
                    </div>
                    <StatusBadge status={application.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeading title="Upcoming programs" action={<LinkAction to="/candidate/learning">Browse programs</LinkAction>} />
            {enrollments.length === 0 ? (
              <EmptyState compact icon={BookOpen} title="No programs joined" description="Workshops, training and mentorship you register for will appear here." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {enrollments.slice(0, 3).map((enrollment) => (
                  <li key={enrollment.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{enrollment.program.title}</p>
                      <p className="text-xs text-slate-500">{PROGRAM_TYPE_LABELS[enrollment.program.type]} · Starts {formatDate(enrollment.program.startDate)}</p>
                    </div>
                    {enrollment.progress > 0 && <Badge tone="brand">{enrollment.progress}% complete</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionHeading title={remaining.length ? "Finish your profile" : "Profile complete"} />
            <ProgressBar value={completion} label="Profile completion" />
            {remaining.length > 0 ? (
              <>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  {remaining.map((item) => (
                    <li key={item.key} className="flex items-start gap-2"><Circle className="mt-1 size-3 shrink-0 text-slate-300" aria-hidden="true" />{item.label}</li>
                  ))}
                </ul>
                <Button to="/candidate/profile" variant="secondary" size="sm" className="mt-4">Update profile</Button>
              </>
            ) : <p className="mt-3 text-sm text-slate-600">Your profile is complete. Recruiters can see your full background.</p>}
          </Card>

          <Card>
            <SectionHeading title="Skill development" icon={Target} />
            {topPath ? (
              <>
                <p className="text-sm text-slate-500">Closest career path</p>
                <p className="mt-0.5 font-display font-bold text-slate-900">{topPath.title}</p>
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={topPath.readiness} label={`${topPath.title} readiness`} />
                  <span className="text-sm font-semibold text-slate-900">{topPath.readiness}%</span>
                </div>
                {topPath.missing.length > 0 && (
                  <p className="mt-3 text-sm text-slate-600">Next to learn: {topPath.missing.slice(0, 2).map((skill) => skill.name).join(', ')}</p>
                )}
                <Button to="/candidate/skill-mapping" variant="secondary" size="sm" className="mt-4">Open skill mapping</Button>
              </>
            ) : <Skeleton className="h-24 w-full" />}
          </Card>

          <Card>
            <SectionHeading title="Assessments" icon={Award} action={<LinkAction to="/candidate/assessments">All</LinkAction>} />
            {results.length === 0 ? (
              <EmptyState compact title="No assessments taken" description="Pass an assessment to earn a verified skill level." />
            ) : (
              <ul className="space-y-3">
                {results.slice(0, 3).map((result) => (
                  <li key={result.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-slate-700">{result.assessmentTitle}</span>
                    <Badge tone="brand">{result.score}% · {SKILL_LEVEL_LABEL[result.level]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
