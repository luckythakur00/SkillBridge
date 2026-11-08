import { Link } from 'react-router-dom';
import { Building2, UserRound } from 'lucide-react';

const ROLES = [
  { value: 'candidate', label: 'Candidate', icon: UserRound },
  { value: 'recruiter', label: 'Recruiter', icon: Building2 },
];

// Switches between the two account types. The URL holds the choice, so it can be linked to directly.
export default function RoleTabs({ active, basePath }) {
  return (
    <div className="mb-7 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1" aria-label="Account type">
      {ROLES.map(({ value, label, icon: Icon }) => (
        <Link
          key={value}
          to={`${basePath}/${value}`}
          aria-current={active === value ? 'page' : undefined}
          className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition-colors ${
            active === value ? 'bg-white text-navy-900 shadow-card' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </div>
  );
}
