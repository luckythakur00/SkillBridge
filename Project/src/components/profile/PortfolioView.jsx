import { Award, BadgeCheck, Briefcase, ExternalLink, FolderKanban, GraduationCap, MapPin, Trophy } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Avatar, Badge, Card, EmptyState, SectionHeading, SkillTag } from '../ui/Primitives';
import { CANDIDATE_CATEGORY_LABELS, SKILL_LEVEL_LABEL } from '../../constants';
import { formatDate } from '../../utils/format';
import { educationItems, experienceItems } from '../../utils/profileItems';

const safeUrl = (value) => (value && /^https?:\/\//i.test(value) ? value : null);

export function ExternalLinks({ github, linkedin }) {
  const githubUrl = safeUrl(github);
  const linkedinUrl = safeUrl(linkedin);
  if (!githubUrl && !linkedinUrl) return null;
  const linkClass = 'inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600';
  return (
    <div className="flex flex-wrap gap-4">
      {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className={linkClass}><FaGithub className="size-4" aria-hidden="true" />GitHub</a>}
      {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className={linkClass}><FaLinkedin className="size-4" aria-hidden="true" />LinkedIn</a>}
    </div>
  );
}

export function SkillsByLevel({ skills, emptyText = 'No skills added yet.' }) {
  if (!skills.length) return <p className="text-sm text-slate-500">{emptyText}</p>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <li key={skill.name}>
          <SkillTag verified={skill.verified}>{skill.name} · {SKILL_LEVEL_LABEL[skill.level]}</SkillTag>
        </li>
      ))}
    </ul>
  );
}

export function TimelineList({ items }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-600">{item.subtitle}</p>
            </div>
            {item.period && <Badge>{item.period}</Badge>}
          </div>
          {item.detail && <p className="mt-1.5 text-sm text-slate-600">{item.detail}</p>}
        </li>
      ))}
    </ul>
  );
}


export function ProjectList({ projects }) {
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {projects.map((project) => (
        <li key={project.id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{project.title}</p>
            {safeUrl(project.link) && (
              <a href={project.link} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}`} className="text-slate-400 hover:text-brand-600">
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            )}
          </div>
          <p className="mt-1.5 text-sm text-slate-600">{project.description}</p>
          {project.tags?.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">{project.tags.map((tag) => <SkillTag key={tag}>{tag}</SkillTag>)}</div>
          )}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, icon, items, children }) {
  if (!items?.length) return null;
  return (
    <Card>
      <SectionHeading title={title} icon={icon} />
      {children}
    </Card>
  );
}

export default function PortfolioView({ portfolio }) {
  const verified = portfolio.skills.filter((skill) => skill.verified);
  const others = portfolio.skills.filter((skill) => !skill.verified);
  const results = portfolio.assessmentResults ?? [];
  const isEmpty = !portfolio.skills.length && !portfolio.education.length && !portfolio.projects.length;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={portfolio.fullName} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{portfolio.fullName}</h1>
              <Badge tone="brand">{CANDIDATE_CATEGORY_LABELS[portfolio.category]}</Badge>
            </div>
            {portfolio.headline && <p className="mt-1 text-slate-600">{portfolio.headline}</p>}
            {portfolio.location && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-4" aria-hidden="true" />{portfolio.location}</p>
            )}
            <div className="mt-3"><ExternalLinks github={portfolio.github} linkedin={portfolio.linkedin} /></div>
          </div>
        </div>
        {portfolio.bio && <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-600">{portfolio.bio}</p>}
      </Card>

      {isEmpty && (
        <Card><EmptyState icon={FolderKanban} title="This portfolio is just getting started" description="Skills, projects and certifications will appear here once they are added." /></Card>
      )}

      <Section title="Verified skills" icon={BadgeCheck} items={verified}>
        <p className="mb-3 text-sm text-slate-500">Confirmed by passing a platform assessment.</p>
        <SkillsByLevel skills={verified} />
        {results.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
            {results.map((result) => (
              <li key={result.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span className="font-medium text-slate-800">{result.assessmentTitle}</span>
                <span className="text-slate-500">{result.score}% · {formatDate(result.takenAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Other skills" items={others}><SkillsByLevel skills={others} /></Section>
      <Section title="Projects" icon={FolderKanban} items={portfolio.projects}><ProjectList projects={portfolio.projects} /></Section>
      <Section title="Experience" icon={Briefcase} items={portfolio.experience}><TimelineList items={experienceItems(portfolio.experience)} /></Section>
      <Section title="Academic records" icon={GraduationCap} items={portfolio.education}><TimelineList items={educationItems(portfolio.education)} /></Section>
      <Section title="Certifications" icon={Award} items={portfolio.certifications}>
        <ul className="space-y-3">
          {portfolio.certifications.map((certificate) => (
            <li key={certificate.id} className="text-sm">
              <p className="font-semibold text-slate-900">{certificate.name}</p>
              <p className="text-slate-500">{certificate.issuer} · {certificate.date}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Achievements" icon={Trophy} items={portfolio.achievements}>
        <ul className="space-y-2 text-sm text-slate-600">
          {portfolio.achievements.map((achievement) => <li key={achievement.id}>{achievement.text}</li>)}
        </ul>
      </Section>
    </div>
  );
}
