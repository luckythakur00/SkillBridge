import { Link } from 'react-router-dom';
import { AlertTriangle, BadgeCheck, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import Button from './Button';
import { initials } from '../../utils/format';

const BADGE_TONES = {
  neutral: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-700',
  info: 'bg-indigo-50 text-indigo-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-700',
};

export function Badge({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${BADGE_TONES[tone]} ${className}`}>
      {Icon && <Icon className="size-3" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function VerifiedMark({ label = 'Verified' }) {
  return (
    <span title={label} className="inline-flex text-brand-600">
      <BadgeCheck className="size-4" aria-label={label} />
    </span>
  );
}

export function SkillTag({ children, verified = false, muted = false }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${muted ? 'border-slate-200 bg-white text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
      {children}
      {verified && <BadgeCheck className="size-3.5 text-brand-600" aria-label="Verified by assessment" />}
    </span>
  );
}

export function Card({ as: Component = 'div', className = '', padded = true, children, ...props }) {
  return (
    <Component className={`rounded-xl border border-slate-200 bg-white shadow-card ${padded ? 'p-5 sm:p-6' : ''} ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function SectionHeading({ title, description, action, icon: Icon }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-bold">
          {Icon && <Icon className="size-4 text-brand-600" aria-hidden="true" />}
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, actions, backTo, backLabel }) {
  return (
    <div className="mb-6">
      {backTo && (
        <Link to={backTo} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ChevronLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Avatar({ name, src, color = 'bg-navy-800', size = 'md', square = false }) {
  const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg', xl: 'size-20 text-2xl' };
  const shape = square ? 'rounded-lg' : 'rounded-full';
  if (src) {
    return <img src={src} alt="" className={`${sizes[size]} ${shape} shrink-0 border border-slate-200 bg-white object-contain`} />;
  }
  return (
    <span aria-hidden="true" className={`${sizes[size]} ${shape} ${color} flex shrink-0 items-center justify-center font-display font-bold text-white`}>
      {initials(name)}
    </span>
  );
}

export function OrgLogo({ organization, size = 'md' }) {
  return <Avatar name={organization?.name} src={organization?.logoUrl} color={organization?.logoColor} size={size} square />;
}

export function StatCard({ label, value, icon: Icon, hint, to }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </>
  );
  const classes = 'block rounded-xl border border-slate-200 bg-white p-5 shadow-card';
  if (to) {
    return <Link to={to} className={`${classes} transition hover:border-brand-300 hover:shadow-raised`}>{content}</Link>;
  }
  return <div className={classes}>{content}</div>;
}

export function ProgressBar({ value, label, tone = 'brand', size = 'md' }) {
  const tones = { brand: 'bg-brand-600', success: 'bg-emerald-600', neutral: 'bg-slate-400' };
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`w-full overflow-hidden rounded-full bg-slate-100 ${size === 'sm' ? 'h-1.5' : 'h-2'}`}
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ease-out ${tones[tone]}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} aria-hidden="true" />;
}

export function CardGridSkeleton({ count = 6, className = 'md:grid-cols-2 xl:grid-cols-3' }) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="mt-5 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
          <Skeleton className="mt-5 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="grid grid-cols-2 gap-4 pt-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, compact = false }) {
  return (
    <div className={`flex flex-col items-center px-6 text-center ${compact ? 'py-8' : 'py-14'}`}>
      {Icon && (
        <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold">Something went wrong</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}

export function Tabs({ tabs, active, onChange, label }) {
  return (
    <div className="mb-5 overflow-x-auto border-b border-slate-200">
      <div role="tablist" aria-label={label} className="flex min-w-max gap-5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active === tab.value}
            onClick={() => onChange(tab.value)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              active === tab.value ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`rounded-full px-1.5 text-xs ${active === tab.value ? 'bg-brand-50' : 'bg-slate-100'}`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
      <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
      <Button variant="secondary" size="sm" iconRight={ChevronRight} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</Button>
    </nav>
  );
}

export function TableShell({ children }) {
  return <div className="relative overflow-x-auto">{children}</div>;
}

export function DetailItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />}
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium break-words text-slate-800">{children}</p>
      </div>
    </div>
  );
}
