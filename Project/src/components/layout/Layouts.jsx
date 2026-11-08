import { Suspense, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Award, BarChart3, Building2, CheckCircle2, GraduationCap, Target, Users } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import Logo from './Logo';
import { PageLoader } from '../ui/Primitives';

// Scrolls to the top on page changes, and to the section on links such as /#how-it-works.
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return undefined;
    }
    // The target section may be in a page that is still loading.
    const timer = setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 80);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><PageLoader /></div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

const AUTH_PANELS = {
  candidate: {
    eyebrow: 'For candidates',
    title: 'Show what you can do, and find work that fits.',
    points: [
      { icon: Award, text: 'Earn verified skill levels through assessments' },
      { icon: Target, text: 'See your skill gaps for the roles you want' },
      { icon: GraduationCap, text: 'Apply to jobs, internships and industry programs' },
    ],
  },
  recruiter: {
    eyebrow: 'For organizations',
    title: 'Hire and collaborate based on proven skills.',
    points: [
      { icon: Users, text: 'Compare applicants by skill compatibility' },
      { icon: Building2, text: 'Publish jobs, internships, training and research' },
      { icon: BarChart3, text: 'Track your recruitment pipeline and results' },
    ],
  },
};

export function AuthShell({ audience = 'candidate', children }) {
  const panel = AUTH_PANELS[audience];
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-navy-950 p-10 lg:flex xl:p-14">
        <Logo dark />
        <div>
          <p className="text-sm font-semibold text-brand-400">{panel.eyebrow}</p>
          <h2 className="mt-3 max-w-md text-3xl leading-tight font-bold text-white">{panel.title}</h2>
          <ul className="mt-8 space-y-4">
            {panel.points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-brand-300">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          One account type for each side. Your category or organization type is part of your profile.
        </p>
      </aside>
      <main className="flex flex-col px-4 py-6 sm:px-8 lg:px-12">
        <div className="mb-8 lg:hidden"><Logo /></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-4">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/" className="hover:text-brand-600">Back to home</Link>
        </p>
      </main>
    </div>
  );
}
