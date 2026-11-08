import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Award, BadgeCheck, BarChart3, BookOpen, Briefcase, Building2, CheckCircle2, ClipboardCheck, Factory,
  FolderKanban, GraduationCap, Handshake, Landmark, Rocket, School, Target, University, UserRound, Users,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { CardGridSkeleton, Skeleton } from '../../components/ui/Primitives';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import { recruiterService } from '../../services/recruiterService';
import { useJobStore } from '../../store/jobStore';
import { useAuthStore } from '../../store/authStore';
import { ROLE_HOME } from '../../constants';
import { APP_NAME } from '../../config/app';

const STEPS = [
  { icon: UserRound, title: 'Build your profile', text: 'Add your education, projects and experience, or set up your organization profile.' },
  { icon: ClipboardCheck, title: 'Prove your skills', text: 'Take assessments to earn verified skill levels that recruiters can trust.' },
  { icon: Target, title: 'Find your gaps', text: 'Compare your skills with what industry roles require, and see what to learn next.' },
  { icon: Handshake, title: 'Connect', text: 'Apply to matched opportunities, or shortlist candidates by skill compatibility.' },
];

const CANDIDATE_FEATURES = [
  { icon: Award, text: 'Technical, soft skill and aptitude assessments' },
  { icon: Target, text: 'Skill gap analysis and career path suggestions' },
  { icon: Briefcase, text: 'Jobs and internships ranked by skill match' },
  { icon: BookOpen, text: 'Training, certifications, workshops and mentorship' },
  { icon: FolderKanban, text: 'A shareable digital portfolio of verified skills' },
];

const RECRUITER_FEATURES = [
  { icon: Briefcase, text: 'Publish and manage jobs and internships' },
  { icon: Users, text: 'Search candidates and compare skill compatibility' },
  { icon: CheckCircle2, text: 'Move applicants through a clear hiring pipeline' },
  { icon: GraduationCap, text: 'Run training, guest lectures and research programs' },
  { icon: BarChart3, text: 'Track applications, skills and posting performance' },
];

const ORG_TYPES = [
  { icon: Building2, label: 'IT companies' },
  { icon: Factory, label: 'Non-IT companies' },
  { icon: Rocket, label: 'Startups' },
  { icon: School, label: 'Colleges' },
  { icon: University, label: 'Universities' },
  { icon: Landmark, label: 'Institutions' },
];

const COLLABORATIONS = [
  { title: 'Internships and placements', text: 'Recruit interns and graduates based on proven skills, not only resumes.' },
  { title: 'Faculty development', text: 'Offer faculty internships, industrial training and development programs.' },
  { title: 'Research and consultancy', text: 'Start funded research and consultancy projects with academic experts.' },
  { title: 'Live industry projects', text: 'Give students real problems to solve, supervised by both sides.' },
];

const PREVIEW_SKILLS = [
  { name: 'React.js', value: 100, met: true },
  { name: 'REST APIs', value: 100, met: true },
  { name: 'Node.js', value: 67, met: false },
  { name: 'Docker', value: 50, met: false },
];

function ProductPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-raised sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Skill match</p>
            <p className="mt-0.5 font-display text-base font-bold text-slate-900">Full-Stack Software Engineer</p>
          </div>
          <span className="rounded-lg bg-brand-50 px-2.5 py-1 font-display text-lg font-bold text-brand-700">78%</span>
        </div>
        <ul className="mt-5 space-y-3.5">
          {PREVIEW_SKILLS.map((skill) => (
            <li key={skill.name}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-700">{skill.name}</span>
                <span className={skill.met ? 'font-medium text-emerald-700' : 'text-slate-500'}>{skill.met ? 'Requirement met' : 'Gap to close'}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${skill.met ? 'bg-brand-600' : 'bg-brand-300'}`} style={{ width: `${skill.value}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center gap-2.5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <BookOpen className="size-4 shrink-0 text-brand-600" />
          Suggested next: Cloud Engineering Bootcamp, to close your Docker gap
        </div>
      </div>
      <div className="mt-4 ml-auto w-[85%] rounded-2xl border border-slate-200 bg-white p-4 shadow-raised lg:absolute lg:-bottom-14 lg:-left-10 lg:mt-0 lg:ml-0 lg:w-72">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <BadgeCheck className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Shortlisted</p>
            <p className="text-xs text-slate-500">Application moved to the next stage</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureColumn({ eyebrow, title, features, cta, ctaTo, secondaryTo, dark = false }) {
  return (
    <div className={`flex flex-col rounded-2xl p-7 sm:p-9 ${dark ? 'bg-navy-950 text-slate-300' : 'border border-slate-200 bg-white shadow-card'}`}>
      <p className={`text-sm font-semibold ${dark ? 'text-brand-400' : 'text-brand-600'}`}>{eyebrow}</p>
      <h3 className={`mt-2 text-2xl font-bold ${dark ? 'text-white' : ''}`}>{title}</h3>
      <ul className="mt-6 flex-1 space-y-3.5">
        {features.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-sm">
            <Icon className={`mt-0.5 size-4 shrink-0 ${dark ? 'text-brand-400' : 'text-brand-600'}`} aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button to={ctaTo} variant={dark ? 'inverse' : 'primary'} iconRight={ArrowRight}>{cta}</Button>
        <Link to={secondaryTo} className={`text-sm font-semibold hover:underline ${dark ? 'text-slate-200' : 'text-slate-700'}`}>Sign in</Link>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const results = useJobStore((state) => state.results);
  const loading = useJobStore((state) => state.loading.results);
  const search = useJobStore((state) => state.search);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    search({ featured: 'true', pageSize: 3 });
    recruiterService.getPublicStats().then(setStats).catch(() => setStats(null));
  }, [search]);

  const statItems = stats && [
    { value: stats.opportunities, label: 'Open jobs and internships' },
    { value: stats.organizations, label: 'Partner organizations' },
    { value: stats.programs, label: 'Learning and research programs' },
    { value: stats.assessments, label: 'Skill assessments' },
  ];

  return (
    <>
      <section className="overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-20 lg:pb-24">
          <div>
            <p className="text-sm font-semibold text-brand-600">Skill mapping, internships and placement</p>
            <h1 className="mt-3 text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl">
              Where academic talent meets industry demand
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              {APP_NAME} helps candidates prove their skills and find the right opportunities, and helps organizations hire and collaborate based on what people can actually do.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Button to={ROLE_HOME[user.role]} size="lg" iconRight={ArrowRight}>Go to my dashboard</Button>
              ) : (
                <>
                  <Button to="/register/candidate" size="lg" icon={UserRound}>I am a candidate</Button>
                  <Button to="/register/recruiter" size="lg" variant="navy" icon={Building2}>I represent an organization</Button>
                </>
              )}
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Just looking? <Link to="/opportunities" className="font-semibold text-brand-600 hover:underline">Browse open opportunities</Link>
            </p>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section aria-label="Platform statistics" className="border-b border-slate-200 bg-slate-50">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-9 sm:px-6 lg:grid-cols-4 lg:px-8">
          {statItems
            ? statItems.map((item) => (
              <div key={item.label}>
                <dd className="font-display text-3xl font-bold text-navy-900">{item.value}</dd>
                <dt className="mt-0.5 text-sm text-slate-500">{item.label}</dt>
              </div>
            ))
            : [0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-14" />)}
        </dl>
      </section>

      <section id="how-it-works" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand-600">How it works</p>
            <h2 className="mt-2 text-3xl font-bold">From classroom skills to industry opportunities</h2>
          </div>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="border-t-2 border-navy-900 pt-5">
                <div className="flex items-center justify-between">
                  <Icon className="size-6 text-brand-600" aria-hidden="true" />
                  <span className="font-display text-sm font-bold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-bold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-bold">Two portals, one shared goal</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <FeatureColumn
              eyebrow="Candidate portal"
              title="For students, graduates, professionals and faculty"
              features={CANDIDATE_FEATURES}
              cta="Join as a candidate"
              ctaTo="/register/candidate"
              secondaryTo="/login/candidate"
            />
            <FeatureColumn
              dark
              eyebrow="Recruiter portal"
              title="For companies, colleges and institutions"
              features={RECRUITER_FEATURES}
              cta="Join as a recruiter"
              ctaTo="/register/recruiter"
              secondaryTo="/login/recruiter"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand-600">Featured opportunities</p>
              <h2 className="mt-2 text-3xl font-bold">Open right now</h2>
            </div>
            <Button to="/opportunities" variant="secondary" iconRight={ArrowRight}>View all opportunities</Button>
          </div>
          <div className="mt-8">
            {loading && !results.items.length ? (
              <CardGridSkeleton count={3} className="md:grid-cols-3" />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.items.slice(0, 3).map((item) => (
                  <OpportunityCard key={item.id} opportunity={item} basePath={user?.role === 'CANDIDATE' ? '/candidate/opportunities' : '/opportunities'} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="organizations" className="border-t border-slate-200 bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-brand-600">Organization collaboration</p>
            <h2 className="mt-2 text-3xl font-bold">One recruiter account for every kind of organization</h2>
            <p className="mt-4 text-slate-600">
              Companies, colleges and universities all use the same recruiter portal. Your organization type is simply part of your profile.
            </p>
            <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ORG_TYPES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
                  <Icon className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <dl className="divide-y divide-slate-200 border-y border-slate-200">
            {COLLABORATIONS.map((item) => (
              <div key={item.title} className="py-5">
                <dt className="font-display font-bold text-slate-900">{item.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-navy-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to bridge the gap?</h2>
            <p className="mt-2 text-slate-300">Create your account in under two minutes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button to="/register/candidate" variant="inverse" size="lg">Join as a candidate</Button>
            <Button to="/register/recruiter" size="lg">Join as a recruiter</Button>
          </div>
        </div>
      </section>
    </>
  );
}
