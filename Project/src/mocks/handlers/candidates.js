import { getDb, newId } from '../db';
import { badRequest, candidateOf, candidateSummary, conflict, forbidden, includesText, notFound, nowIso, organizationOf, paginate, serializeApplication } from '../helpers';
import { computeMatch } from '../../utils/skillMatch';
import { MAX_RESUME_BYTES, RESUME_EXTENSIONS } from '../../config/app';
import { validateFile } from '../../utils/validators';

const SECTIONS = ['education', 'experience', 'projects', 'certifications', 'achievements'];
const EDITABLE_FIELDS = ['fullName', 'headline', 'phone', 'location', 'university', 'degree', 'graduationYear', 'cgpa', 'department', 'designation', 'github', 'linkedin', 'bio', 'category', 'portfolioPublic'];

const getSection = (name) => {
  if (!SECTIONS.includes(name)) throw notFound('Profile section');
  return name;
};

function updateProfile({ user, body }) {
  const candidate = candidateOf(user);
  EDITABLE_FIELDS.forEach((field) => {
    if (field in body) candidate[field] = body[field];
  });
  if (body.fullName) user.name = body.fullName;
  return candidate;
}

function addItem({ user, params, body }) {
  const candidate = candidateOf(user);
  const section = getSection(params.section);
  candidate[section].push({ ...body, id: newId(section.slice(0, 3)) });
  return candidate;
}

function updateItem({ user, params, body }) {
  const candidate = candidateOf(user);
  const section = getSection(params.section);
  const index = candidate[section].findIndex((item) => item.id === params.id);
  if (index < 0) throw notFound('Item');
  candidate[section][index] = { ...body, id: params.id };
  return candidate;
}

function removeItem({ user, params }) {
  const candidate = candidateOf(user);
  const section = getSection(params.section);
  candidate[section] = candidate[section].filter((item) => item.id !== params.id);
  return candidate;
}

function addSkill({ user, body }) {
  const candidate = candidateOf(user);
  const name = String(body.name ?? '').trim();
  if (!name) throw badRequest('Skill name is required.');
  const existing = candidate.skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    if (existing.verified) throw conflict(`${existing.name} is verified by an assessment. Retake the assessment to change its level.`);
    existing.level = body.level;
    existing.type = body.type;
    return candidate;
  }
  const known = getDb().skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
  candidate.skills.push({ name: known?.name ?? name, type: body.type ?? known?.type ?? 'TECHNICAL', level: body.level ?? 'BEGINNER', verified: false });
  return candidate;
}

function removeSkill({ user, params }) {
  const candidate = candidateOf(user);
  const name = decodeURIComponent(params.name);
  candidate.skills = candidate.skills.filter((s) => s.name !== name);
  return candidate;
}

function uploadResume({ user, body }) {
  const candidate = candidateOf(user);
  const file = body.get('file');
  if (!file) throw badRequest('Choose a file to upload.');
  const error = validateFile(file, { extensions: RESUME_EXTENSIONS, maxBytes: MAX_RESUME_BYTES });
  if (error) throw badRequest(error);
  // The mock stores only file details. A real backend stores the file itself.
  candidate.resume = { fileName: file.name, fileSize: file.size, uploadedAt: nowIso() };
  return candidate;
}

function removeResume({ user }) {
  const candidate = candidateOf(user);
  candidate.resume = null;
  return candidate;
}

const withAssessmentTitles = (candidateId) => {
  const db = getDb();
  return db.assessmentResults
    .filter((r) => r.candidateId === candidateId)
    .map((r) => ({ ...r, assessmentTitle: db.assessments.find((a) => a.id === r.assessmentId)?.title }));
};

function getPortfolio({ params, user }) {
  const candidate = getDb().candidates.find((c) => c.id === params.id);
  if (!candidate) throw notFound('Portfolio');
  const isOwner = candidate.userId === user?.id;
  if (candidate.portfolioPublic === false && !isOwner && user?.role !== 'RECRUITER') {
    throw forbidden('This portfolio is private.');
  }
  // Contact details are deliberately left out of the shareable portfolio.
  const { fullName, headline, category, location, university, degree, graduationYear, cgpa, bio, github, linkedin, skills, education, experience, projects, certifications, achievements, portfolioPublic } = candidate;
  return { id: candidate.id, fullName, headline, category, location, university, degree, graduationYear, cgpa, bio, github, linkedin, skills, education, experience, projects, certifications, achievements, portfolioPublic: portfolioPublic !== false, assessmentResults: withAssessmentTitles(candidate.id) };
}

function searchCandidates({ params, user }) {
  const db = getDb();
  const query = (params.q ?? '').trim().toLowerCase();
  const opportunity = params.opportunityId && db.opportunities.find((o) => o.id === params.opportunityId);
  if (opportunity && opportunity.organizationId !== user.organizationId) throw forbidden();

  const results = db.candidates
    .filter((c) => {
      if (params.category && c.category !== params.category) return false;
      if (params.verifiedOnly === 'true' && !c.skills.some((s) => s.verified)) return false;
      if (params.skill && !c.skills.some((s) => s.name.toLowerCase() === params.skill.toLowerCase())) return false;
      if (params.location && !includesText(c.location, params.location.toLowerCase())) return false;
      if (!query) return true;
      return [c.fullName, c.headline, c.university, c.location].some((v) => includesText(v, query)) ||
        c.skills.some((s) => includesText(s.name, query));
    })
    .map((c) => ({
      ...candidateSummary(c),
      matchScore: opportunity ? computeMatch(c.skills, opportunity.requiredSkills).score : null,
    }));

  if (opportunity) results.sort((a, b) => b.matchScore - a.matchScore);
  return paginate(results, params);
}

function getCandidate({ params, user }) {
  const db = getDb();
  const candidate = db.candidates.find((c) => c.id === params.id);
  if (!candidate) throw notFound('Candidate');
  const organization = organizationOf(user);
  const ownIds = db.opportunities.filter((o) => o.organizationId === organization.id).map((o) => o.id);
  const applications = db.applications
    .filter((a) => a.candidateId === candidate.id && ownIds.includes(a.opportunityId))
    .map((a) => serializeApplication(a, { forRecruiter: true }));
  return { ...candidate, applications, assessmentResults: withAssessmentTitles(candidate.id) };
}

export const candidateRoutes = [
  ['GET', '/candidates/me', ({ user }) => candidateOf(user), { role: 'CANDIDATE' }],
  ['PATCH', '/candidates/me', updateProfile, { role: 'CANDIDATE' }],
  ['POST', '/candidates/me/skills', addSkill, { role: 'CANDIDATE' }],
  ['DELETE', '/candidates/me/skills/:name', removeSkill, { role: 'CANDIDATE' }],
  ['POST', '/candidates/me/resume', uploadResume, { role: 'CANDIDATE' }],
  ['DELETE', '/candidates/me/resume', removeResume, { role: 'CANDIDATE' }],
  ['POST', '/candidates/me/:section', addItem, { role: 'CANDIDATE' }],
  ['PUT', '/candidates/me/:section/:id', updateItem, { role: 'CANDIDATE' }],
  ['DELETE', '/candidates/me/:section/:id', removeItem, { role: 'CANDIDATE' }],
  ['GET', '/portfolios/:id', getPortfolio],
  ['GET', '/candidates', searchCandidates, { role: 'RECRUITER' }],
  ['GET', '/candidates/:id', getCandidate, { role: 'RECRUITER' }],
];
