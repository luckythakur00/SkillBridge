import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-card hover:bg-brand-700',
  navy: 'bg-navy-900 text-white shadow-card hover:bg-navy-800',
  secondary: 'border border-slate-300 bg-white text-slate-700 shadow-card hover:border-slate-400 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white shadow-card hover:bg-red-700',
  'danger-ghost': 'text-red-600 hover:bg-red-50',
  inverse: 'bg-white text-navy-900 shadow-card hover:bg-brand-50',
};

const SIZES = {
  sm: 'h-8 gap-1.5 rounded-md px-2.5 text-xs',
  md: 'h-10 gap-2 rounded-lg px-4 text-sm',
  lg: 'h-12 gap-2 rounded-lg px-6 text-sm',
  icon: 'size-9 justify-center rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  disabled,
  ...props
}) {
  const classes = `inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0 ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4';
  const content = (
    <>
      {loading ? <Loader2 className={`${iconSize} animate-spin`} aria-hidden="true" /> : Icon && <Icon className={iconSize} aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className={iconSize} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
