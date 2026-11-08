import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, Mail } from 'lucide-react';
import { AuthShell } from '../../components/layout/Layouts';
import Button from '../../components/ui/Button';
import { Field } from '../../components/ui/Form';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { authService } from '../../services/authService';
import { email, required } from '../../utils/validators';
import { USE_MOCK_API } from '../../config/app';

export default function ForgotPasswordPage() {
  const form = useForm({ email: '' }, { email: [required('Email'), email()] });
  const [sent, setSent] = useState(false);
  const [send, pending] = useAction(() => authService.forgotPassword(form.values.email));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.validate() && (await send())) setSent(true);
  };

  return (
    <AuthShell>
      {sent ? (
        <div className="text-center">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <MailCheck className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-slate-500">
            If an account exists for {form.values.email}, it will receive password reset instructions.
          </p>
          {USE_MOCK_API && (
            <p className="mt-4 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
              This is a demo, so no email is sent. Reset emails start working once the backend is connected.
            </p>
          )}
          <Button to="/login/candidate" variant="secondary" className="mt-6">Back to sign in</Button>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">Enter your account email and we will send reset instructions.</p>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field form={form} name="email" type="email" label="Email address" icon={Mail} autoComplete="email" required />
            <Button type="submit" size="lg" fullWidth loading={pending}>Send reset instructions</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Remembered it? <Link to="/login/candidate" className="font-semibold text-brand-600 hover:underline">Back to sign in</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
