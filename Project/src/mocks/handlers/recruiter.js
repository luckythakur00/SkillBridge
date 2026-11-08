import { getDb } from '../db';
import { notFound, organizationOf, serializeApplication } from '../helpers';
import { postingState } from '../../utils/skillMatch';

const ORG_FIELDS = ['name', 'type', 'industry', 'location', 'description', 'website', 'contactEmail', 'contactPhone', 'size', 'foundedYear', 'logoUrl'];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function updateOrganization({ user, body }) {
  const organization = organizationOf(user);
  ORG_FIELDS.forEach((field) => {
    if (field in body) organization[field] = body[field];
  });
  return organization;
}

function requestVerification({ user }) {
  const organization = organizationOf(user);
  if (organization.verificationStatus === 'UNVERIFIED') organization.verificationStatus = 'PENDING';
  return organization;
}

function analytics({ user }) {
  const db = getDb();
  const organization = organizationOf(user);
  const postings = db.opportunities.filter((o) => o.organizationId === organization.id && !o.deleted);
  const postingIds = new Set(postings.map((o) => o.id));
  const applications = db.applications.filter((a) => postingIds.has(a.opportunityId));
  const countStatus = (list, statuses) => list.filter((a) => statuses.includes(a.status)).length;
  const active = postings.filter((o) => postingState(o) === 'ACTIVE');

  const statusOrder = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'];
  const statusDistribution = statusOrder.map((status) => ({ status, count: countStatus(applications, [status]) }));

  const skillCounts = new Map();
  applications.forEach((application) => {
    const candidate = db.candidates.find((c) => c.id === application.candidateId);
    candidate?.skills.forEach((skill) => skillCounts.set(skill.name, (skillCounts.get(skill.name) ?? 0) + 1));
  });
  const skillDistribution = [...skillCounts.entries()]
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const now = Date.now();
  const trend = Array.from({ length: 8 }, (_, index) => {
    const end = now - (7 - index) * WEEK_MS;
    const start = end - WEEK_MS;
    return {
      weekEnding: new Date(end).toISOString(),
      applications: applications.filter((a) => {
        const at = new Date(a.appliedAt).getTime();
        return at > start && at <= end;
      }).length,
    };
  });

  const performance = postings
    .map((o) => {
      const own = applications.filter((a) => a.opportunityId === o.id);
      return {
        id: o.id,
        title: o.title,
        type: o.type,
        state: postingState(o),
        views: o.viewCount ?? 0,
        applications: own.length,
        shortlisted: countStatus(own, ['SHORTLISTED', 'INTERVIEW', 'SELECTED']),
        selected: countStatus(own, ['SELECTED']),
      };
    })
    .sort((a, b) => b.applications - a.applications);

  const recent = [...applications]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 5)
    .map((a) => serializeApplication(a, { forRecruiter: true }));

  return {
    totals: {
      activeJobs: active.filter((o) => o.type === 'JOB').length,
      activeInternships: active.filter((o) => o.type === 'INTERNSHIP').length,
      expiredPostings: postings.filter((o) => postingState(o) === 'EXPIRED').length,
      applications: applications.length,
      shortlisted: countStatus(applications, ['SHORTLISTED', 'INTERVIEW']),
      selected: countStatus(applications, ['SELECTED']),
      views: postings.reduce((sum, o) => sum + (o.viewCount ?? 0), 0),
    },
    statusDistribution,
    skillDistribution,
    trend,
    performance,
    recent,
  };
}

function publicStats() {
  const db = getDb();
  return {
    opportunities: db.opportunities.filter((o) => !o.deleted && postingState(o) === 'ACTIVE').length,
    organizations: db.organizations.length,
    candidates: db.candidates.length,
    programs: db.programs.filter((p) => postingState(p) === 'ACTIVE').length,
    assessments: db.assessments.length,
  };
}

function publicOrganizations() {
  return getDb().organizations.map(({ id, name, type, industry, location, logoUrl, logoColor, verificationStatus }) => ({
    id, name, type, industry, location, logoUrl, logoColor, verificationStatus,
  }));
}

function subscribe({ body }) {
  const db = getDb();
  if (!db.newsletter.includes(body.email)) db.newsletter.push(body.email);
  return { success: true };
}

function markRead({ user, params }) {
  const notification = getDb().notifications.find((n) => n.id === params.id && n.userId === user.id);
  if (!notification) throw notFound('Notification');
  notification.read = true;
  return notification;
}

function markAllRead({ user }) {
  getDb().notifications.forEach((n) => {
    if (n.userId === user.id) n.read = true;
  });
  return { success: true };
}

function removeNotification({ user, params }) {
  const db = getDb();
  db.notifications = db.notifications.filter((n) => !(n.id === params.id && n.userId === user.id));
  return { success: true };
}

function listNotifications({ user }) {
  return getDb().notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export const recruiterRoutes = [
  ['GET', '/organizations/me', ({ user }) => organizationOf(user), { role: 'RECRUITER' }],
  ['PATCH', '/organizations/me', updateOrganization, { role: 'RECRUITER' }],
  ['POST', '/organizations/me/verification', requestVerification, { role: 'RECRUITER' }],
  ['GET', '/organizations', publicOrganizations],
  ['GET', '/recruiters/me/analytics', analytics, { role: 'RECRUITER' }],
  ['GET', '/stats/public', publicStats],
  ['POST', '/newsletter', subscribe],
  ['GET', '/notifications', listNotifications, { role: 'ANY' }],
  ['POST', '/notifications/read-all', markAllRead, { role: 'ANY' }],
  ['PATCH', '/notifications/:id/read', markRead, { role: 'ANY' }],
  ['DELETE', '/notifications/:id', removeNotification, { role: 'ANY' }],
];
