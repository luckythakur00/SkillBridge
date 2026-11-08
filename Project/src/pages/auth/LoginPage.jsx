import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { AuthShell } from '../../components/layout/Layouts';
import RoleTabs from '../../components/layout/RoleTabs';
import Button from '../../components/ui/Button';
import { Checkbox, Field } from '../../components/ui/Form';
import { useForm } from '../../hooks/useForm';
import { useAuthStore } from '../../store/authStore';
import { email, required } from '../../utils/validators';
import { ROLE_HOME } from '../../constants';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../data/demoAccounts';
import { USE_MOCK_API } from '../../config/app';

const COPY = {
  candidate: { title: 'Candidate sign in', subtitle: 'For students, graduates, professionals and academicians.', placeholder: 'name@university.edu' },
  recruiter: { title: 'Recruiter sign in', subtitle: 'For companies, colleges, universities and other organizations.', placeholder: 'name@organization.com' },
};

// Only allows a return to a page inside this app, for the matching account type.
function safeNextPath(next, role) {
  return next && next.startsWith(`/${role}/`) ? next : null;
}

export default function LoginPage() {
  const { role } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const form = useForm(
    { email: '', password: '', remember: false },
    { email: [required('Email'), email()], password: [required('Password')] },
  );
  const [submitError, setSubmitError] = useState('');
  const [pending, setPending] = useState(false);

  if (!COPY[role]) return <Navigate to="/login/candidate" replace />;
  const copy = COPY[role];
  const apiRole = role.toUpperCase();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    if (!form.validate()) return;
    setPending(true);
    try {
      const user = await login({
        email: form.values.email,
        password: form.values.password,
        remember: form.values.remember,
        role: apiRole,
      });
      navigate(safeNextPath(searchParams.get('next'), role) ?? ROLE_HOME[user.role], { replace: true });
    } catch (error) {
      setSubmitError(error.message);
      setPending(false);
    }
  };

  const fillDemo = (demoEmail) => {
    form.reset({ ...form.values, email: demoEmail, password: DEMO_PASSWORD });
    setSubmitError('');
  };

  return (
    <AuthShell audience={role}>
      <RoleTabs active={role} basePath="/login" />
      <h1 className="text-2xl font-bold">{copy.title}</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">{copy.subtitle}</p>

      {submitError && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field form={form} name="email" type="email" label="Email address" icon={Mail} placeholder={copy.placeholder} autoComplete="email" required />
        <div>
          <Field form={form} as="password" name="password" label="Password" icon={Lock} placeholder="Enter your password" autoComplete="current-password" required />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">Forgot password?</Link>
          </div>
        </div>
        <Checkbox id="remember" name="remember" checked={form.values.remember} onChange={form.handleChange}>
          Remember this device
        </Checkbox>
        <Button type="submit" size="lg" fullWidth loading={pending} iconRight={ArrowRight}>Sign in</Button>
      </form>

      {USE_MOCK_API && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-xs font-semibold text-slate-700">Demo accounts</p>
          <p className="mt-0.5 mb-2.5 text-xs text-slate-500">Choose one to fill in the form, then sign in.</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS[apiRole].map((account) => (
              <Button key={account.email} variant="secondary" size="sm" onClick={() => fillDemo(account.email)}>
                {account.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        New to the platform?{' '}
        <Link to={`/register/${role}`} className="font-semibold text-brand-600 hover:underline">Create a {role} account</Link>
      </p>
    </AuthShell>
  );
}
