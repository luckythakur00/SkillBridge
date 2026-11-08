import { Link } from 'react-router-dom';
import Logo from './Logo';
import Button from '../ui/Button';
import { Field } from '../ui/Form';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { email, required } from '../../utils/validators';
import { recruiterService } from '../../services/recruiterService';
import { APP_NAME } from '../../config/app';

const CURRENT_YEAR = new Date().getFullYear();

const COLUMNS = [
  {
    title: 'Candidates',
    links: [
      { label: 'Browse opportunities', to: '/opportunities' },
      { label: 'Create an account', to: '/register/candidate' },
      { label: 'Candidate sign in', to: '/login/candidate' },
    ],
  },
  {
    title: 'Organizations',
    links: [
      { label: 'Post opportunities', to: '/register/recruiter' },
      { label: 'Recruiter sign in', to: '/login/recruiter' },
      { label: 'How collaboration works', to: '/#organizations' },
    ],
  },
];

export default function Footer() {
  const form = useForm({ email: '' }, { email: [required('Email'), email()] });
  const [subscribe, pending] = useAction(
    () => recruiterService.subscribeNewsletter(form.values.email),
    { success: 'You are on the list for opportunity updates.' },
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.validate() && (await subscribe())) form.reset({ email: '' });
  };

  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Connecting candidates, academic institutions and organizations through skills, internships and placements.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="mb-4 text-sm font-semibold text-white">{column.title}</h2>
              <ul className="space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition-colors hover:text-white">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">Stay informed</h2>
            <p className="mb-3 text-sm text-slate-400">Get updates on new internships, placement drives and industry programs.</p>
            <form onSubmit={handleSubmit} noValidate className="flex items-start gap-2 [&_input]:border-navy-700 [&_input]:bg-navy-800 [&_input]:text-white [&_label]:sr-only [&_p]:text-red-300">
              <Field form={form} name="email" type="email" label="Email address" placeholder="you@example.com" className="flex-1" autoComplete="email" />
              <Button type="submit" loading={pending} className="h-[42px]">Join</Button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-navy-800 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {CURRENT_YEAR} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
