import { Link } from 'react-router-dom';
import { APP_NAME_PARTS, APP_TAGLINE } from '../../config/app';

export function LogoMark({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 32 32" className={`${className} shrink-0`} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0f1d40" />
      <path d="M6 21c3.2-7 6.6-10 10-10s6.8 3 10 10" fill="none" stroke="#60a5fa" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M5 21h22M11 21v-5M16 21v-7.5M21 21v-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ to = '/', dark = false, showTagline = true }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 rounded-lg" aria-label={`${APP_NAME_PARTS.join('')} home`}>
      <LogoMark />
      <span className="flex flex-col">
        <span className={`font-display text-lg leading-none font-extrabold tracking-tight ${dark ? 'text-white' : 'text-navy-900'}`}>
          {APP_NAME_PARTS[0]}
          <span className={dark ? 'text-brand-400' : 'text-brand-600'}>{APP_NAME_PARTS[1]}</span>
        </span>
        {showTagline && (
          <span className={`mt-0.5 text-[10px] font-semibold tracking-wider uppercase ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {APP_TAGLINE}
          </span>
        )}
      </span>
    </Link>
  );
}
