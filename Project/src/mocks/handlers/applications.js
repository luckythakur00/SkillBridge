import { getDb, newId } from '../db';
import { badRequest, candidateOf, conflict, forbidden, notFound, notify, nowIso, organizationOf, serializeApplication } from '../helpers';
import { computeMatch, postingState } from '../../utils/skillMatch';
import { APPLICATION_STATUS, APPLICATION_TRANSITIONS } from '../../constants';
import { formatDate, formatDateTime } from '../../utils/format';

function apply({ user, body }) {
  const db = getDb();
  const candidate = candidateOf(user);
  const opportunity = db.opportunities.find((o) => o.id === body.opportunityId && !o.deleted);
  if (!opportunity) throw notFound('Opportunity');
  if (postingState(opportunity) !== 'ACTIVE') throw conflict('This opportunity is no longer accepting applications.');
  if (db.applications.some((a) => a.candidateId === candidate.id && a.opportunityId === opportunity.id)) {
    throw conflict('You have already applied for this opportunity.');
  }
  const now = nowIso();
  const application = {
    id: newId('app'),
    opportunityId: opportunity.id,
    candidateId: candidate.id,
    status: 'APPLIED',
    coverNote: body.coverNote ?? '',
    resume: candidate.resume,
    matchScore: computeMatch(candidate.skills, opportunity.requiredSkills).score,
    appliedAt: now,
    updatedAt: now,
    timeline: [{ status: 'APPLIED', at: now, note: null }],
    interview: null,
    recruiterNote: '',
  };
  db.applications.push(application);

  const recruiter = db.users.find((u) => u.organizationId === opportunity.organizationId);
  if (recruiter) {
    notify(recruiter.id, 'APPLICATION', 'New application received', `${candidate.fullName} applied for ${opportunity.title}.`, `/recruiter/applications?opportunity=${opportunity.id}`);
  }
  return serializeApplication(application);
}

function mine({ user }) {
  const candidate = candidateOf(user);
  return getDb().applications
    .filter((a) => a.candidateId === candidate.id)
    .map((a) => serializeApplication(a))
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
}

function received({ user, params }) {
  const db = getDb();
  const organization = organizationOf(user);
  const ownIds = new Set(db.opportunities.filter((o) => o.organizationId === organization.id).map((o) => o.id));
  return db.applications
    .filter((a) => ownIds.has(a.opportunityId) && (!params.opportunityId || a.opportunityId === params.opportunityId))
    .map((a) => serializeApplication(a, { forRecruiter: true }))
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
}

function ownApplication(user, id) {
  const db = getDb();
  const application = db.applications.find((a) => a.id === id);
  if (!application) throw notFound('Application');
  const opportunity = db.opportunities.find((o) => o.id === application.opportunityId);
  if (opportunity?.organizationId !== user.organizationId) throw forbidden();
  return { application, opportunity };
}

function moveStatus(application, status, note) {
  if (!APPLICATION_TRANSITIONS[application.status]?.includes(status)) {
    const from = APPLICATION_STATUS[application.status]?.label;
    const to = APPLICATION_STATUS[status]?.label ?? status;
    throw conflict(`An application in "${from}" cannot move to "${to}".`);
  }
  const now = nowIso();
  application.status = status;
  application.updatedAt = now;
  application.timeline.push({ status, at: now, note: note || null });
}

function updateStatus({ user, params, body }) {
  const db = getDb();
  const { application, opportunity } = ownApplication(user, params.id);
  if (body.status === 'WITHDRAWN') throw forbidden('Only the candidate can withdraw an application.');
  if (body.status === 'INTERVIEW') throw badRequest('Schedule the interview to move to this stage.');
  moveStatus(application, body.status, body.note);
  const candidate = db.candidates.find((c) => c.id === application.candidateId);
  if (candidate) {
    const organization = db.organizations.find((o) => o.id === opportunity.organizationId);
    notify(candidate.userId, 'APPLICATION', `Application update: ${APPLICATION_STATUS[body.status].label}`, `${organization?.name}, ${opportunity.title}.`, '/candidate/applications');
  }
  return serializeApplication(application, { forRecruiter: true });
}

function scheduleInterview({ user, params, body }) {
  const db = getDb();
  const { application, opportunity } = ownApplication(user, params.id);
  if (application.status !== 'INTERVIEW') moveStatus(application, 'INTERVIEW', 'Interview scheduled');
  application.interview = { scheduledAt: body.scheduledAt, mode: body.mode, details: body.details ?? '' };
  application.updatedAt = nowIso();
  const candidate = db.candidates.find((c) => c.id === application.candidateId);
  if (candidate) {
    notify(candidate.userId, 'INTERVIEW', 'Interview scheduled', `${opportunity.title}: ${formatDateTime(body.scheduledAt)}.`, '/candidate/applications');
  }
  return serializeApplication(application, { forRecruiter: true });
}

// Progress, mentor feedback and the completion record for a selected intern.
function updateInternship({ user, params, body }) {
  const db = getDb();
  const { application, opportunity } = ownApplication(user, params.id);
  if (opportunity.type !== 'INTERNSHIP' || application.status !== 'SELECTED') {
    throw conflict('Progress can only be recorded for a selected intern.');
  }
  const now = nowIso();
  const record = application.internshipRecord ?? { progress: 0, startedAt: now, completedAt: null, updates: [] };
  if (record.completedAt) throw conflict('This internship is already completed.');

  record.progress = body.complete ? 100 : Math.min(Math.max(Number(body.progress) || 0, 0), 100);
  record.updates.push({ id: newId('upd'), note: body.note, mentorName: body.mentorName ?? '', progress: record.progress, at: now });
  application.internshipRecord = record;
  application.updatedAt = now;

  const candidate = db.candidates.find((c) => c.id === application.candidateId);
  const organization = db.organizations.find((o) => o.id === opportunity.organizationId);
  if (body.complete) {
    record.completedAt = now;
    // The completed internship becomes part of the candidate's portfolio.
    candidate?.experience.push({
      id: newId('exp'),
      title: opportunity.title,
      company: organization?.name ?? '',
      period: `Completed ${formatDate(now, { month: 'short', year: 'numeric' })}`,
      type: 'Internship',
      description: body.note,
      verified: true,
    });
  }
  if (candidate) {
    const title = body.complete ? 'Internship completed' : 'New internship feedback';
    notify(candidate.userId, 'APPLICATION', title, `${organization?.name}, ${opportunity.title}.`, '/candidate/applications');
  }
  return serializeApplication(application, { forRecruiter: true });
}

function withdraw({ user, params }) {
  const db = getDb();
  const candidate = candidateOf(user);
  const application = db.applications.find((a) => a.id === params.id && a.candidateId === candidate.id);
  if (!application) throw notFound('Application');
  moveStatus(application, 'WITHDRAWN', null);
  const opportunity = db.opportunities.find((o) => o.id === application.opportunityId);
  const recruiter = db.users.find((u) => u.organizationId === opportunity?.organizationId);
  if (recruiter) notify(recruiter.id, 'APPLICATION', 'Application withdrawn', `${candidate.fullName} withdrew from ${opportunity.title}.`, '/recruiter/applications');
  return serializeApplication(application);
}

export const applicationRoutes = [
  ['POST', '/applications', apply, { role: 'CANDIDATE' }],
  ['GET', '/applications/mine', mine, { role: 'CANDIDATE' }],
  ['GET', '/applications/received', received, { role: 'RECRUITER' }],
  ['POST', '/applications/:id/withdraw', withdraw, { role: 'CANDIDATE' }],
  ['PATCH', '/applications/:id/status', updateStatus, { role: 'RECRUITER' }],
  ['PUT', '/applications/:id/interview', scheduleInterview, { role: 'RECRUITER' }],
  ['PATCH', '/applications/:id/internship', updateInternship, { role: 'RECRUITER' }],
];
