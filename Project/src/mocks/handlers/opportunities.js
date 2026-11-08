import { getDb, newId } from '../db';
import { candidateOf, conflict, forbidden, includesText, notFound, notify, nowIso, organizationOf, paginate, serializeOpportunity, viewerCandidate } from '../helpers';
import { postingState } from '../../utils/skillMatch';
import { formatDate } from '../../utils/format';

const live = () => getDb().opportunities.filter((o) => !o.deleted);

function listOpportunities({ params, user }) {
  const candidate = viewerCandidate(user);
  const query = (params.q ?? '').trim().toLowerCase();

  const filtered = live().filter((o) => {
    if (postingState(o) !== 'ACTIVE') return false;
    if (params.type && o.type !== params.type) return false;
    if (params.workMode && o.workMode !== params.workMode) return false;
    if (params.experienceLevel && o.experienceLevel !== params.experienceLevel) return false;
    if (params.featured === 'true' && !o.featured) return false;
    const organization = getDb().organizations.find((org) => org.id === o.organizationId);
    if (params.organizationType && organization?.type !== params.organizationType) return false;
    if (params.skill && !o.requiredSkills.some((s) => s.name.toLowerCase() === params.skill.toLowerCase())) return false;
    if (!query) return true;
    return includesText(o.title, query) || includesText(organization?.name, query) || includesText(o.location, query) ||
      o.requiredSkills.some((s) => includesText(s.name, query));
  });

  const items = filtered.map((o) => serializeOpportunity(o, candidate));
  const sorters = {
    deadline: (a, b) => new Date(a.deadline) - new Date(b.deadline),
    match: (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0),
    recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  };
  items.sort(sorters[params.sort] ?? sorters.recent);
  return paginate(items, params);
}

function getOpportunity({ params, user }) {
  const opportunity = live().find((o) => o.id === params.id);
  if (!opportunity) throw notFound('Opportunity');
  opportunity.viewCount = (opportunity.viewCount ?? 0) + 1;
  return serializeOpportunity(opportunity, viewerCandidate(user), { includeMatchDetail: true });
}

// Students and fresh graduates are not recommended roles that ask for years of experience.
const EARLY_CAREER_LEVELS = ['FRESHER', 'JUNIOR'];

function recommended({ user }) {
  const candidate = candidateOf(user);
  const earlyCareer = ['STUDENT', 'GRADUATE'].includes(candidate.category);
  return live()
    .filter((o) => postingState(o) === 'ACTIVE')
    .filter((o) => !earlyCareer || EARLY_CAREER_LEVELS.includes(o.experienceLevel))
    .filter((o) => !getDb().applications.some((a) => a.candidateId === candidate.id && a.opportunityId === o.id))
    .map((o) => serializeOpportunity(o, candidate))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}

function savedList({ user }) {
  const candidate = candidateOf(user);
  return getDb().savedOpportunities
    .filter((s) => s.candidateId === candidate.id)
    .map((s) => live().find((o) => o.id === s.opportunityId))
    .filter(Boolean)
    .map((o) => serializeOpportunity(o, candidate));
}

function save({ user, params }) {
  const db = getDb();
  const candidate = candidateOf(user);
  if (!live().some((o) => o.id === params.id)) throw notFound('Opportunity');
  const exists = db.savedOpportunities.some((s) => s.candidateId === candidate.id && s.opportunityId === params.id);
  if (!exists) db.savedOpportunities.push({ candidateId: candidate.id, opportunityId: params.id, savedAt: nowIso() });
  return { saved: true };
}

function unsave({ user, params }) {
  const db = getDb();
  const candidate = candidateOf(user);
  db.savedOpportunities = db.savedOpportunities.filter((s) => !(s.candidateId === candidate.id && s.opportunityId === params.id));
  return { saved: false };
}

function ownPosting(user, id) {
  const organization = organizationOf(user);
  const opportunity = live().find((o) => o.id === id);
  if (!opportunity) throw notFound('Posting');
  if (opportunity.organizationId !== organization.id) throw forbidden('This posting belongs to another organization.');
  return opportunity;
}

function mine({ user }) {
  const organization = organizationOf(user);
  return live()
    .filter((o) => o.organizationId === organization.id)
    .map((o) => serializeOpportunity(o))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function create({ user, body }) {
  const organization = organizationOf(user);
  const opportunity = {
    ...body,
    id: newId('opp'),
    organizationId: organization.id,
    status: 'ACTIVE',
    featured: false,
    viewCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  getDb().opportunities.push(opportunity);
  return serializeOpportunity(opportunity);
}

function update({ user, params, body }) {
  const opportunity = ownPosting(user, params.id);
  const { id, organizationId, viewCount, featured, createdAt, status } = opportunity;
  Object.assign(opportunity, body, { id, organizationId, viewCount, featured, createdAt, status, updatedAt: nowIso() });
  return serializeOpportunity(opportunity);
}

function setStatus({ user, params, body }) {
  const opportunity = ownPosting(user, params.id);
  if (body.status === 'ACTIVE' && postingState({ ...opportunity, status: 'ACTIVE' }) === 'EXPIRED') {
    throw conflict(`The deadline (${formatDate(opportunity.deadline)}) has passed. Edit the posting to set a new deadline first.`);
  }
  opportunity.status = body.status;
  opportunity.updatedAt = nowIso();
  return serializeOpportunity(opportunity);
}

function remove({ user, params }) {
  const db = getDb();
  const opportunity = ownPosting(user, params.id);
  // Soft delete, so candidates keep their application history.
  opportunity.deleted = true;
  db.savedOpportunities = db.savedOpportunities.filter((s) => s.opportunityId !== opportunity.id);
  db.applications
    .filter((a) => a.opportunityId === opportunity.id && !['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(a.status))
    .forEach((a) => {
      const candidate = db.candidates.find((c) => c.id === a.candidateId);
      if (candidate) notify(candidate.userId, 'APPLICATION', 'Posting removed', `${opportunity.title} is no longer available.`, '/candidate/applications');
    });
  return { success: true };
}

export const opportunityRoutes = [
  ['GET', '/opportunities/recommended', recommended, { role: 'CANDIDATE' }],
  ['GET', '/opportunities/saved', savedList, { role: 'CANDIDATE' }],
  ['GET', '/opportunities/mine', mine, { role: 'RECRUITER' }],
  ['GET', '/opportunities', listOpportunities],
  ['POST', '/opportunities', create, { role: 'RECRUITER' }],
  ['GET', '/opportunities/:id', getOpportunity],
  ['PUT', '/opportunities/:id', update, { role: 'RECRUITER' }],
  ['PATCH', '/opportunities/:id/status', setStatus, { role: 'RECRUITER' }],
  ['DELETE', '/opportunities/:id', remove, { role: 'RECRUITER' }],
  ['PUT', '/opportunities/:id/save', save, { role: 'CANDIDATE' }],
  ['DELETE', '/opportunities/:id/save', unsave, { role: 'CANDIDATE' }],
];
