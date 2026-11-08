import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Building2, Clock, Save, ShieldAlert, Trash2, Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Field } from '../../components/ui/Form';
import { Badge, Card, ErrorState, OrgLogo, PageHeader, PageLoader, SectionHeading } from '../../components/ui/Primitives';
import { useRecruiterStore } from '../../store/recruiterStore';
import { useAuthStore } from '../../store/authStore';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { toast } from '../../store/toastStore';
import { email, numberRange, phone, required, url, validateFile } from '../../utils/validators';
import { ORGANIZATION_TYPES, VERIFICATION_STATUS } from '../../constants';
import { LOGO_EXTENSIONS, MAX_LOGO_BYTES } from '../../config/app';

const SIZE_OPTIONS = ['1–10', '11–50', '51–200', '201–500', '501–1,000', '1,001–5,000', '5,000+'].map((value) => ({ value, label: `${value} people` }));
const VERIFICATION_ICONS = { VERIFIED: BadgeCheck, PENDING: Clock, UNVERIFIED: ShieldAlert };
const CURRENT_YEAR = new Date().getFullYear();

const schema = {
  name: [required('Organization name')],
  type: [required('Organization type')],
  website: [url()],
  contactEmail: [email()],
  contactPhone: [phone()],
  foundedYear: [numberRange(1800, CURRENT_YEAR, 'Founded year')],
};

function OrganizationForm({ organization }) {
  const updateOrganization = useRecruiterStore((state) => state.updateOrganization);
  const requestVerification = useRecruiterStore((state) => state.requestVerification);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const fileInput = useRef(null);
  const [logoUrl, setLogoUrl] = useState(organization.logoUrl);
  const form = useForm({
    name: organization.name ?? '',
    type: organization.type ?? '',
    industry: organization.industry ?? '',
    location: organization.location ?? '',
    description: organization.description ?? '',
    website: organization.website ?? '',
    contactEmail: organization.contactEmail ?? '',
    contactPhone: organization.contactPhone ?? '',
    size: organization.size ?? '',
    foundedYear: organization.foundedYear ?? '',
  }, schema);

  const [save, saving] = useAction(
    async () => {
      await updateOrganization({ ...form.values, logoUrl });
      await refreshUser();
    },
    { success: 'Organization profile saved.', form },
  );
  const [verify, verifying] = useAction(requestVerification, { success: 'Verification requested. We will review your details.' });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (form.validate()) save();
  };

  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const error = validateFile(file, { extensions: LOGO_EXTENSIONS, maxBytes: MAX_LOGO_BYTES });
    if (error) {
      toast.error(error);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result);
    reader.onerror = () => toast.error('That image could not be read.');
    reader.readAsDataURL(file);
  };

  const verification = VERIFICATION_STATUS[organization.verificationStatus];
  const VerificationIcon = VERIFICATION_ICONS[organization.verificationStatus];

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="space-y-6">
        <Card>
          <SectionHeading title="Logo" />
          <div className="flex items-center gap-4">
            <OrgLogo organization={{ name: form.values.name, logoUrl, logoColor: organization.logoColor }} size="xl" />
            <div className="flex flex-col items-start gap-1.5">
              <input ref={fileInput} type="file" accept={LOGO_EXTENSIONS.join(',')} onChange={handleLogo} className="sr-only" aria-label="Upload logo" tabIndex={-1} />
              <Button variant="secondary" size="sm" icon={Upload} onClick={() => fileInput.current?.click()}>Upload</Button>
              {logoUrl && <Button variant="danger-ghost" size="sm" icon={Trash2} onClick={() => setLogoUrl(null)}>Remove</Button>}
              <p className="text-xs text-slate-500">PNG, JPG or SVG, up to 200 KB.</p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeading title="Verification" />
          <Badge tone={verification.tone} icon={VerificationIcon}>{verification.label}</Badge>
          <p className="mt-3 text-sm text-slate-600">
            {organization.verificationStatus === 'VERIFIED' && 'Candidates see a verified mark next to your organization.'}
            {organization.verificationStatus === 'PENDING' && 'Your details are being reviewed.'}
            {organization.verificationStatus === 'UNVERIFIED' && 'Verified organizations earn more trust from candidates.'}
          </p>
          {organization.verificationStatus === 'UNVERIFIED' && (
            <Button variant="secondary" size="sm" className="mt-3" loading={verifying} onClick={() => verify()}>Request verification</Button>
          )}
        </Card>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <Card>
          <SectionHeading title="Organization details" icon={Building2} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field form={form} name="name" label="Organization name" required className="sm:col-span-2" />
            <Field form={form} as="select" name="type" label="Organization type" options={ORGANIZATION_TYPES} required />
            <Field form={form} name="industry" label="Industry" placeholder="Information Technology" />
            <Field form={form} name="location" label="Location" placeholder="City, Country" />
            <Field form={form} as="select" name="size" label="Size" placeholderOption="Select size" options={SIZE_OPTIONS} />
            <Field form={form} name="foundedYear" type="number" label="Founded year" />
            <Field form={form} name="website" type="url" label="Website" placeholder="https://" />
            <Field form={form} as="textarea" name="description" label="Description" placeholder="What does your organization do, and what is it like to work with you?" className="sm:col-span-2" />
          </div>
        </Card>
        <Card>
          <SectionHeading title="Contact details" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field form={form} name="contactEmail" type="email" label="Contact email" />
            <Field form={form} name="contactPhone" type="tel" label="Contact phone" />
          </div>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" size="lg" icon={Save} loading={saving}>Save changes</Button>
        </div>
      </div>
    </form>
  );
}

export default function OrganizationPage() {
  const organization = useRecruiterStore((state) => state.organization);
  const loading = useRecruiterStore((state) => state.loading.organization);
  const error = useRecruiterStore((state) => state.errors.organization);
  const fetchOrganization = useRecruiterStore((state) => state.fetchOrganization);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  return (
    <div>
      <PageHeader title="Organization profile" description="Candidates see these details on your postings and programs." />
      {error && !organization && <Card><ErrorState message={error} onRetry={fetchOrganization} /></Card>}
      {loading && !organization && <PageLoader />}
      {organization && <OrganizationForm key={organization.id} organization={organization} />}
    </div>
  );
}
