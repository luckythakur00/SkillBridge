import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, DatabaseZap, KeyRound, ShieldAlert, Trash2, UserRound } from 'lucide-react';
import Button from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';
import { Field } from '../../components/ui/Form';
import { Badge, Card, DetailItem, PageHeader, SectionHeading } from '../../components/ui/Primitives';
import { useAuthStore } from '../../store/authStore';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { matches, password, required } from '../../utils/validators';
import { CANDIDATE_CATEGORY_LABELS, ORGANIZATION_TYPE_LABELS } from '../../constants';
import { formatDate } from '../../utils/format';
import { USE_MOCK_API } from '../../config/app';

const PREFERENCES = {
  CANDIDATE: [
    { key: 'emailApplications', title: 'Application updates', description: 'When a recruiter changes your application status or schedules an interview.' },
    { key: 'emailOpportunities', title: 'New opportunities', description: 'When a new opportunity matches your skills.' },
    { key: 'emailPrograms', title: 'Programs and workshops', description: 'Reminders about programs you joined and new ones.' },
  ],
  RECRUITER: [
    { key: 'emailApplications', title: 'New applications', description: 'When a candidate applies to one of your postings.' },
    { key: 'emailOpportunities', title: 'Posting reminders', description: 'When a posting is about to expire.' },
    { key: 'emailPrograms', title: 'Program registrations', description: 'When a candidate registers for one of your programs.' },
  ],
};

function PasswordCard() {
  const changePassword = useAuthStore((state) => state.changePassword);
  const blank = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const form = useForm(blank, {
    currentPassword: [required('Current password')],
    newPassword: [required('New password'), password()],
    confirmPassword: [required('Please confirm your password'), matches('newPassword', 'Passwords do not match.')],
  });
  const [submit, pending] = useAction(
    () => changePassword({ currentPassword: form.values.currentPassword, newPassword: form.values.newPassword }),
    { success: 'Your password was changed.', form },
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.validate() && (await submit())) form.reset(blank);
  };

  return (
    <Card>
      <SectionHeading title="Change password" icon={KeyRound} />
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field form={form} as="password" name="currentPassword" label="Current password" autoComplete="current-password" required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field form={form} as="password" name="newPassword" label="New password" hint="At least 8 characters." autoComplete="new-password" required />
          <Field form={form} as="password" name="confirmPassword" label="Confirm new password" autoComplete="new-password" required />
        </div>
        <Button type="submit" loading={pending}>Update password</Button>
      </form>
    </Card>
  );
}

function PreferenceToggle({ item, checked, onChange }) {
  const id = `preference-${item.key}`;
  return (
    <li className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium text-slate-900">{item.title}</span>
        <span className="block text-sm text-slate-500">{item.description}</span>
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </li>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updatePreferences = useAuthStore((state) => state.updatePreferences);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const logout = useAuthStore((state) => state.logout);
  const [confirm, setConfirm] = useState(null); // 'delete' | 'reset' | null

  const [savePreference] = useAction((key, value) => updatePreferences({ [key]: value }), { success: 'Preference saved.' });
  const [removeAccount, deleting] = useAction(async () => {
    await deleteAccount();
    navigate('/', { replace: true });
  });
  const [resetDemo, resetting] = useAction(async () => {
    const { resetDb } = await import('../../mocks/server');
    resetDb();
    logout();
    navigate('/', { replace: true });
  });

  const accountType = user.role === 'CANDIDATE' ? 'Candidate' : 'Recruiter';
  const profileType = user.role === 'CANDIDATE' ? CANDIDATE_CATEGORY_LABELS[user.category] : ORGANIZATION_TYPE_LABELS[user.organizationType];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your account, security and notifications." />

      <Card>
        <SectionHeading title="Account" icon={UserRound} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="Name">{user.name}</DetailItem>
          <DetailItem label="Email">{user.email}</DetailItem>
          <DetailItem label="Account type"><Badge tone="brand">{accountType}</Badge></DetailItem>
          <DetailItem label={user.role === 'CANDIDATE' ? 'Category' : 'Organization type'}>{profileType}</DetailItem>
          <DetailItem label="Member since">{formatDate(user.createdAt)}</DetailItem>
        </div>
      </Card>

      <PasswordCard />

      <Card>
        <SectionHeading
          title="Email notifications"
          icon={Bell}
          description={USE_MOCK_API ? 'Your choices are saved. The demo does not send email.' : undefined}
        />
        <ul className="divide-y divide-slate-100">
          {PREFERENCES[user.role].map((item) => (
            <PreferenceToggle key={item.key} item={item} checked={Boolean(user.preferences?.[item.key])} onChange={(value) => savePreference(item.key, value)} />
          ))}
        </ul>
      </Card>

      {USE_MOCK_API && (
        <Card>
          <SectionHeading title="Demo data" icon={DatabaseZap} description="Restore all sample data, and remove every change made in this browser." />
          <Button variant="secondary" onClick={() => setConfirm('reset')}>Reset demo data</Button>
        </Card>
      )}

      <Card className="border-red-200">
        <SectionHeading title="Delete account" icon={ShieldAlert} description="This permanently removes your account and cannot be undone." />
        <Button variant="danger-ghost" icon={Trash2} onClick={() => setConfirm('delete')}>Delete my account</Button>
      </Card>

      <ConfirmDialog
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        title="Delete your account?"
        description={user.role === 'CANDIDATE'
          ? 'Your profile, applications and assessment results will be permanently removed.'
          : 'Your login will be removed and all your postings and programs will be closed.'}
        confirmLabel="Delete account"
        loading={deleting}
        onConfirm={removeAccount}
      />
      <ConfirmDialog
        open={confirm === 'reset'}
        onClose={() => setConfirm(null)}
        title="Reset all demo data?"
        description="Every change and new account made in this browser will be lost, and you will be signed out."
        confirmLabel="Reset data"
        loading={resetting}
        onConfirm={resetDemo}
      />
    </div>
  );
}
