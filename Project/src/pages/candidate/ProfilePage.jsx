import { useEffect, useState } from 'react';
import { Award, Briefcase, CheckCircle2, Circle, Eye, FolderKanban, GraduationCap, Mail, MapPin, Pencil, Phone, Trophy } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Field } from '../../components/ui/Form';
import { Avatar, Badge, Card, ErrorState, PageLoader, ProgressBar, SectionHeading, SkillTag } from '../../components/ui/Primitives';
import CollectionSection from '../../components/profile/CollectionSection';
import SkillsEditor from '../../components/profile/SkillsEditor';
import ResumeCard from '../../components/profile/ResumeCard';
import { ExternalLinks } from '../../components/profile/PortfolioView';
import { useCandidateStore } from '../../store/candidateStore';
import { useAuthStore } from '../../store/authStore';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { numberRange, phone, required, url } from '../../utils/validators';
import { profileChecklist, profileCompletion } from '../../utils/skillMatch';
import { CANDIDATE_CATEGORIES, CANDIDATE_CATEGORY_LABELS } from '../../constants';

const SECTION_CONFIG = {
  education: [
    { name: 'institution', label: 'Institution', required: true, placeholder: 'College or university name' },
    { name: 'degree', label: 'Degree or course', required: true, placeholder: 'B.Tech in Computer Science' },
    { name: 'period', label: 'Period', required: true, placeholder: '2023 – 2027' },
    { name: 'score', label: 'Score', placeholder: 'CGPA: 8.5' },
  ],
  experience: [
    { name: 'title', label: 'Role', required: true, placeholder: 'Software Engineering Intern' },
    { name: 'company', label: 'Organization', required: true },
    { name: 'period', label: 'Period', required: true, placeholder: 'May – Jul 2026' },
    { name: 'type', label: 'Type', placeholder: 'Internship or Full-time' },
    { name: 'description', label: 'What you did', as: 'textarea' },
  ],
  projects: [
    { name: 'title', label: 'Project title', required: true },
    { name: 'description', label: 'Description', as: 'textarea', required: true },
    { name: 'tags', label: 'Technologies', list: true, placeholder: 'React, Node.js, MongoDB', hint: 'Separate with commas.' },
    { name: 'link', label: 'Project link', type: 'url', placeholder: 'https://github.com/you/project' },
  ],
  certifications: [
    { name: 'name', label: 'Certification', required: true },
    { name: 'issuer', label: 'Issued by', required: true },
    { name: 'date', label: 'Date issued', required: true, placeholder: 'Aug 2025' },
    { name: 'credentialUrl', label: 'Credential link', type: 'url', placeholder: 'https://' },
  ],
  achievements: [{ name: 'text', label: 'Achievement', as: 'textarea', required: true }],
};

const CURRENT_YEAR = new Date().getFullYear();

function EditProfileModal({ profile, onClose }) {
  const updateProfile = useCandidateStore((state) => state.updateProfile);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const form = useForm(
    {
      fullName: profile.fullName ?? '',
      headline: profile.headline ?? '',
      category: profile.category,
      phone: profile.phone ?? '',
      location: profile.location ?? '',
      bio: profile.bio ?? '',
      university: profile.university ?? '',
      degree: profile.degree ?? '',
      graduationYear: profile.graduationYear ?? '',
      cgpa: profile.cgpa ?? '',
      department: profile.department ?? '',
      designation: profile.designation ?? '',
      github: profile.github ?? '',
      linkedin: profile.linkedin ?? '',
    },
    {
      fullName: [required('Full name')],
      phone: [phone()],
      github: [url()],
      linkedin: [url()],
      graduationYear: [numberRange(1960, CURRENT_YEAR + 8, 'Graduation year')],
    },
  );
  const [save, pending] = useAction(
    async () => {
      await updateProfile(form.values);
      await refreshUser();
    },
    { success: 'Your profile was updated.', form },
  );
  const isAcademician = form.values.category === 'ACADEMICIAN';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.validate() && (await save())) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Edit profile details"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="profile-form" loading={pending}>Save changes</Button>
        </>
      }
    >
      <form id="profile-form" onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field form={form} name="fullName" label="Full name" required />
        <Field form={form} as="select" name="category" label="I am a" options={CANDIDATE_CATEGORIES} />
        <Field form={form} name="headline" label="Headline" placeholder="A one-line summary of who you are" className="sm:col-span-2" />
        <Field form={form} name="phone" type="tel" label="Phone" />
        <Field form={form} name="location" label="Location" placeholder="City, Country" />
        <Field form={form} as="textarea" name="bio" label="About you" className="sm:col-span-2" />
        <Field form={form} name="university" label={isAcademician ? 'Institution' : 'College / University'} />
        <Field form={form} name="degree" label={isAcademician ? 'Highest qualification' : 'Degree'} />
        {isAcademician ? (
          <>
            <Field form={form} name="department" label="Department" />
            <Field form={form} name="designation" label="Designation" placeholder="Associate Professor" />
          </>
        ) : (
          <>
            <Field form={form} name="graduationYear" type="number" label="Graduation year" />
            <Field form={form} name="cgpa" label="CGPA or percentage" />
          </>
        )}
        <Field form={form} name="github" type="url" label="GitHub link" placeholder="https://github.com/you" />
        <Field form={form} name="linkedin" type="url" label="LinkedIn link" placeholder="https://linkedin.com/in/you" />
      </form>
    </Modal>
  );
}

function CompletionCard({ profile }) {
  const percentage = profileCompletion(profile);
  const remaining = profileChecklist(profile).filter((item) => !item.done);
  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <div className="mb-2 flex items-center justify-between text-sm font-medium">
        <span className="text-slate-700">Profile completion</span>
        <span className="font-semibold text-brand-700">{percentage}%</span>
      </div>
      <ProgressBar value={percentage} label="Profile completion" />
      {remaining.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
          {remaining.map((item) => (
            <li key={item.key} className="flex items-center gap-1.5"><Circle className="size-3 text-slate-300" aria-hidden="true" />{item.label}</li>
          ))}
        </ul>
      )}
      {remaining.length === 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700"><CheckCircle2 className="size-4" aria-hidden="true" />Your profile is complete.</p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const profile = useCandidateStore((state) => state.profile);
  const loading = useCandidateStore((state) => state.loading.profile);
  const error = useCandidateStore((state) => state.errors.profile);
  const fetchProfile = useCandidateStore((state) => state.fetchProfile);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (error && !profile) return <Card><ErrorState message={error} onRetry={fetchProfile} /></Card>;
  if (loading && !profile) return <PageLoader />;
  if (!profile) return null;

  const educationLine = [profile.degree, profile.university, profile.graduationYear && `Class of ${profile.graduationYear}`, profile.cgpa && `CGPA ${profile.cgpa}`].filter(Boolean).join(' · ');

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={profile.fullName} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.fullName}</h1>
              <Badge tone="brand">{CANDIDATE_CATEGORY_LABELS[profile.category]}</Badge>
            </div>
            <p className="mt-1 text-slate-600">{profile.headline || 'Add a headline so recruiters can see who you are.'}</p>
            {educationLine && <p className="mt-1 text-sm text-slate-500">{educationLine}</p>}
            {profile.department && <p className="mt-1 text-sm text-slate-500">{[profile.designation, profile.department].filter(Boolean).join(', ')}</p>}
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
              {profile.location && <li className="flex items-center gap-1.5"><MapPin className="size-4 text-slate-400" aria-hidden="true" />{profile.location}</li>}
              <li className="flex items-center gap-1.5 break-all"><Mail className="size-4 shrink-0 text-slate-400" aria-hidden="true" />{profile.email}</li>
              {profile.phone && <li className="flex items-center gap-1.5"><Phone className="size-4 text-slate-400" aria-hidden="true" />{profile.phone}</li>}
            </ul>
            <div className="mt-3"><ExternalLinks github={profile.github} linkedin={profile.linkedin} /></div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button to="/candidate/portfolio" variant="secondary" icon={Eye}>Portfolio</Button>
            <Button icon={Pencil} onClick={() => setEditOpen(true)}>Edit</Button>
          </div>
        </div>
        <CompletionCard profile={profile} />
      </Card>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <SectionHeading title="About" />
            <p className="text-sm leading-relaxed text-slate-600">{profile.bio || 'Tell recruiters about your interests and goals. Select Edit to add a short bio.'}</p>
          </Card>
          <SkillsEditor skills={profile.skills} />
          <ResumeCard resume={profile.resume} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <CollectionSection
            section="education"
            title="Education"
            singular="Education entry"
            icon={GraduationCap}
            emptyIcon={GraduationCap}
            emptyText="Add your college, university or school."
            fields={SECTION_CONFIG.education}
            items={profile.education}
            renderItem={(item) => (
              <>
                <p className="text-sm font-semibold text-slate-900">{item.institution}</p>
                <p className="text-sm text-slate-600">{item.degree}</p>
                <p className="mt-0.5 text-xs text-slate-500">{[item.period, item.score].filter(Boolean).join(' · ')}</p>
              </>
            )}
          />
          <CollectionSection
            section="experience"
            title="Experience"
            singular="Experience entry"
            description="Internships and work experience."
            icon={Briefcase}
            emptyIcon={Briefcase}
            emptyText="Add internships, jobs or teaching roles."
            fields={SECTION_CONFIG.experience}
            items={profile.experience}
            renderItem={(item) => (
              <>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.company}{item.type ? ` · ${item.type}` : ''}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.period}</p>
                {item.description && <p className="mt-1.5 text-sm text-slate-600">{item.description}</p>}
              </>
            )}
          />
          <CollectionSection
            section="projects"
            title="Projects"
            singular="Project"
            icon={FolderKanban}
            emptyIcon={FolderKanban}
            emptyText="Show recruiters what you have built."
            fields={SECTION_CONFIG.projects}
            items={profile.projects}
            renderItem={(item) => (
              <>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>
                {item.tags?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{item.tags.map((tag) => <SkillTag key={tag}>{tag}</SkillTag>)}</div>}
              </>
            )}
          />
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
            <CollectionSection
              section="certifications"
              title="Certifications"
              singular="Certification"
              icon={Award}
              emptyIcon={Award}
              emptyText="Add courses and credentials you have earned."
              fields={SECTION_CONFIG.certifications}
              items={profile.certifications}
              renderItem={(item) => (
                <>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.issuer} · {item.date}</p>
                </>
              )}
            />
            <CollectionSection
              section="achievements"
              title="Achievements"
              singular="Achievement"
              icon={Trophy}
              emptyIcon={Trophy}
              emptyText="Add awards, publications and honours."
              fields={SECTION_CONFIG.achievements}
              items={profile.achievements}
              renderItem={(item) => <p className="text-sm text-slate-700">{item.text}</p>}
            />
          </div>
        </div>
      </div>

      {editOpen && <EditProfileModal profile={profile} onClose={() => setEditOpen(false)} />}
    </div>
  );
}

