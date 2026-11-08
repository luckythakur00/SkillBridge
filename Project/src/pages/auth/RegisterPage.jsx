import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle, ArrowRight, BookOpen, Briefcase, Building, Building2, Factory, GraduationCap, Landmark,
  Lock, Mail, Rocket, School, Shapes, Sprout, University, UserRound,
} from 'lucide-react';
import { AuthShell } from '../../components/layout/Layouts';
import RoleTabs from '../../components/layout/RoleTabs';
import Button from '../../components/ui/Button';
import { Checkbox, ChoiceTile, Field, FormField } from '../../components/ui/Form';
import { useForm } from '../../hooks/useForm';
import { useAuthStore } from '../../store/authStore';
import { email, matches, mustAccept, password, required } from '../../utils/validators';
import { CANDIDATE_CATEGORIES, ORGANIZATION_TYPES, ROLE_HOME } from '../../constants';
import { USE_MOCK_API } from '../../config/app';

const CATEGORY_ICONS = { STUDENT: GraduationCap, GRADUATE: Sprout, PROFESSIONAL: Briefcase, ACADEMICIAN: BookOpen };
const ORG_ICONS = {
  IT_COMPANY: Building2,
  NON_IT_COMPANY: Factory,
  COLLEGE: School,
  UNIVERSITY: University,
  EDUCATIONAL_INSTITUTION: Landmark,
  STARTUP: Rocket,
  TRAINING_INSTITUTE: Building,
  OTHER: Shapes,
};

const baseSchema = {
  name: [required('Name')],
  email: [required('Email'), email()],
  password: [required('Password'), password()],
  confirmPassword: [required('Please confirm your password'), matches('password', 'Passwords do not match.')],
  agreeTerms: [mustAccept('Please accept the terms to continue.')],
};
const SCHEMAS = {
  candidate: { category: [required('Category')], ...baseSchema },
  recruiter: { organizationType: [required('Organization type')], organizationName: [required('Organization name')], ...baseSchema },
};

export default function RegisterPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const form = useForm({
    category: '',
    organizationType: '',
    organizationName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [submitError, setSubmitError] = useState('');
  const [pending, setPending] = useState(false);

  if (!SCHEMAS[role]) return <Navigate to="/register/candidate" replace />;
  const isCandidate = role === 'candidate';
  const { values, errors } = form;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    if (!form.validate(SCHEMAS[role])) return;
    setPending(true);
    try {
      const user = await register({
        role: role.toUpperCase(),
        name: values.name,
        email: values.email,
        password: values.password,
        ...(isCandidate
          ? { category: values.category }
          : { organizationType: values.organizationType, organizationName: values.organizationName }),
      });
      navigate(ROLE_HOME[user.role], { replace: true });
    } catch (error) {
      setSubmitError(error.message);
      setPending(false);
    }
  };

  return (
    <AuthShell audience={role}>
      <RoleTabs active={role} basePath="/register" />
      <h1 className="text-2xl font-bold">{isCandidate ? 'Create your candidate account' : 'Register your organization'}</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        {isCandidate ? 'Tell us where you are, so we can show relevant opportunities.' : 'One recruiter account works for every type of organization.'}
      </p>

      {submitError && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {isCandidate ? (
          <FormField id="category" label="I am a" required error={errors.category}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CANDIDATE_CATEGORIES.map(({ value, label }) => (
                <ChoiceTile key={value} selected={values.category === value} onClick={() => form.setValue('category', value)} icon={CATEGORY_ICONS[value]} title={label} />
              ))}
            </div>
          </FormField>
        ) : (
          <>
            <FormField id="organizationType" label="Organization type" required error={errors.organizationType}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ORGANIZATION_TYPES.map(({ value, label }) => (
                  <ChoiceTile key={value} selected={values.organizationType === value} onClick={() => form.setValue('organizationType', value)} icon={ORG_ICONS[value]} title={label} />
                ))}
              </div>
            </FormField>
            <Field form={form} name="organizationName" label="Organization name" icon={Building2} placeholder="Your organization" required />
          </>
        )}

        <Field form={form} name="name" label={isCandidate ? 'Full name' : 'Your name'} icon={UserRound} placeholder="Your full name" autoComplete="name" required />
        <Field form={form} name="email" type="email" label={isCandidate ? 'Email address' : 'Work email'} icon={Mail} placeholder={isCandidate ? 'name@university.edu' : 'name@organization.com'} autoComplete="email" required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field form={form} as="password" name="password" label="Password" icon={Lock} placeholder="8+ characters" autoComplete="new-password" required />
          <Field form={form} as="password" name="confirmPassword" label="Confirm password" icon={Lock} placeholder="Repeat password" autoComplete="new-password" required />
        </div>
        {USE_MOCK_API && (
          <p className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
            This demo stores data in your browser without encryption. Please do not use a real password.
          </p>
        )}
        <Checkbox id="agreeTerms" name="agreeTerms" checked={values.agreeTerms} onChange={form.handleChange} error={errors.agreeTerms}>
          I agree to the <Link to="/terms" target="_blank" className="font-medium text-brand-600 hover:underline">Terms of Service</Link> and{' '}
          <Link to="/privacy" target="_blank" className="font-medium text-brand-600 hover:underline">Privacy Policy</Link>.
        </Checkbox>
        <Button type="submit" size="lg" fullWidth loading={pending} iconRight={ArrowRight}>Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{' '}
        <Link to={`/login/${role}`} className="font-semibold text-brand-600 hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
