import { ApiError } from '../services/apiError';
import { computeMatch, postingState } from '../utils/skillMatch';
import { getDb, newId } from './db';

export const notFound = (what = 'Resource') => new ApiError(404, `${what} not found.`);
export const forbidden = (message = 'You do not have access to this resource.') => new ApiError(403, message);
export const badRequest = (message, fieldErrors = null) => new ApiError(400, message, fieldErrors);
export const conflict = (message) => new ApiError(409, message);

export const nowIso = () => new Date().toISOString();

export function candidateOf(user) {
  const candidate = user && getDb().candidates.find((c) => c.userId === user.id);
  if (!candidate) throw notFound('Candidate profile');
  return candidate;
}

export function organizationOf(user) {
  const organization = user && getDb().organizations.find((o) => o.id === user.organizationId);
  if (!organization) throw notFound('Organization');
  return organization;
}

export const viewerCandidate = (user) =>
  user?.role === 'CANDIDATE' ? getDb().candidates.find((c) => c.userId === user.id) : null;

export function organizationSummary(organizationId) {
  const org = getDb().organizations.find((o) => o.id === organizationId);
  if (!org) return null;
  const { id, name, type, industry, location, logoUrl, logoColor, verificationStatus } = org;
  return { id, name, type, industry, location, logoUrl, logoColor, verificationStatus };
}

export function serializeOpportunity(opportunity, candidate = null, { includeMatchDetail = false } = {}) {
  const db = getDb();
  const applications = db.applications.filter((a) => a.opportunityId === opportunity.id);
  const result = {
    ...opportunity,
    organization: organizationSummary(opportunity.organizationId),
    state: postingState(opportunity),
    applicantCount: applications.length,
  };
  if (candidate) {
    const match = computeMatch(candidate.skills, opportunity.requiredSkills);
    const own = applications.find((a) => a.candidateId === candidate.id);
    result.matchScore = match.score;
    result.isSaved = db.savedOpportunities.some(
      (s) => s.candidateId === candidate.id && s.opportunityId === opportunity.id,
    );
    result.applicationStatus = own?.status ?? null;
    if (includeMatchDetail) result.match = match;
  }
  return result;
}

export function serializeProgram(program, candidate = null) {
  const enrollments = getDb().enrollments.filter((e) => e.programId === program.id);
  return {
    ...program,
    organization: organizationSummary(program.organizationId),
    state: postingState(program),
    enrolledCount: enrollments.length,
    seatsLeft: Math.max(program.seats - enrollments.length, 0),
    isEnrolled: candidate ? enrollments.some((e) => e.candidateId === candidate.id) : false,
  };
}

export function candidateSummary(candidate) {
  const { id, fullName, headline, category, location, university, degree, graduationYear, cgpa, skills, resume } = candidate;
  return { id, fullName, headline, category, location, university, degree, graduationYear, cgpa, skills, resume };
}

export function serializeApplication(application, { forRecruiter = false } = {}) {
  const db = getDb();
  const opportunity = db.opportunities.find((o) => o.id === application.opportunityId);
  const candidate = db.candidates.find((c) => c.id === application.candidateId);
  const { recruiterNote, ...visible } = application;
  const result = {
    ...visible,
    opportunity: opportunity && {
      id: opportunity.id,
      title: opportunity.title,
      type: opportunity.type,
      location: opportunity.location,
      deleted: Boolean(opportunity.deleted),
      requiredSkills: opportunity.requiredSkills,
      organization: organizationSummary(opportunity.organizationId),
    },
  };
  if (forRecruiter) {
    result.recruiterNote = recruiterNote;
    result.candidate = candidate ? candidateSummary(candidate) : null;
  }
  return result;
}

export function notify(userId, type, title, message, link) {
  getDb().notifications.unshift({
    id: newId('ntf'),
    userId,
    type,
    title,
    message,
    link,
    read: false,
    createdAt: nowIso(),
  });
}

export function paginate(items, { page = 1, pageSize = 12 }) {
  const size = Math.max(Number(pageSize) || 12, 1);
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / size), 1);
  const current = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  return { items: items.slice((current - 1) * size, current * size), total, page: current, pageSize: size, totalPages };
}

export const includesText = (value, query) => String(value ?? '').toLowerCase().includes(query);
