import { getDb } from '../db';
import { forbidden, organizationOf } from '../helpers';
import { computeMatch, postingState } from '../../utils/skillMatch';

const INSTITUTION_TYPES = ['COLLEGE', 'UNIVERSITY', 'EDUCATIONAL_INSTITUTION'];

function placementStatus(applications) {
  if (applications.some((a) => a.status === 'SELECTED')) return 'PLACED';
  if (applications.some((a) => ['SHORTLISTED', 'INTERVIEW'].includes(a.status))) return 'IN_PROCESS';
  if (applications.some((a) => ['APPLIED', 'UNDER_REVIEW'].includes(a.status))) return 'APPLYING';
  return 'NOT_STARTED';
}

const tally = (counts, name) => counts.set(name, (counts.get(name) ?? 0) + 1);
const topEntries = (counts, limit = 8) =>
  [...counts.entries()].map(([skill, count]) => ({ skill, count })).sort((a, b) => b.count - a.count).slice(0, limit);

// For colleges and universities: the progress of their own students, and what industry is asking for.
function insights({ user }) {
  const db = getDb();
  const organization = organizationOf(user);
  if (!INSTITUTION_TYPES.includes(organization.type)) {
    throw forbidden('Institution insights are available to colleges, universities and educational institutions.');
  }

  const name = organization.name.toLowerCase();
  const students = db.candidates.filter((c) =>
    c.category !== 'ACADEMICIAN' &&
    (c.university?.toLowerCase() === name || c.education.some((e) => e.institution.toLowerCase() === name)));

  const activePostings = db.opportunities.filter((o) => !o.deleted && postingState(o) === 'ACTIVE');
  const demand = new Map();
  activePostings.forEach((o) => o.requiredSkills.forEach((skill) => tally(demand, skill.name)));

  const rejectionGaps = new Map();
  const rows = students.map((student) => {
    const applications = db.applications.filter((a) => a.candidateId === student.id);
    const readiness = Math.max(0, ...db.careerPaths.map((path) => computeMatch(student.skills, path.requiredSkills).score));
    applications.filter((a) => a.status === 'REJECTED').forEach((application) => {
      const opportunity = db.opportunities.find((o) => o.id === application.opportunityId);
      if (opportunity) computeMatch(student.skills, opportunity.requiredSkills).missing.forEach((skill) => tally(rejectionGaps, skill.name));
    });
    return {
      id: student.id,
      fullName: student.fullName,
      degree: student.degree,
      graduationYear: student.graduationYear,
      skillCount: student.skills.length,
      verifiedSkills: student.skills.filter((skill) => skill.verified).length,
      readiness,
      applications: applications.length,
      internships: applications.filter((a) => a.status === 'SELECTED' && db.opportunities.find((o) => o.id === a.opportunityId)?.type === 'INTERNSHIP').length,
      placementStatus: placementStatus(applications),
    };
  });

  const count = (status) => rows.filter((row) => row.placementStatus === status).length;
  return {
    totals: {
      students: rows.length,
      averageReadiness: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.readiness, 0) / rows.length) : 0,
      withVerifiedSkills: rows.filter((row) => row.verifiedSkills > 0).length,
      inInternships: rows.filter((row) => row.internships > 0).length,
      placed: count('PLACED'),
      inProcess: count('IN_PROCESS'),
    },
    students: rows.sort((a, b) => b.readiness - a.readiness),
    skillDemand: topEntries(demand),
    rejectionGaps: topEntries(rejectionGaps),
  };
}

export const institutionRoutes = [
  ['GET', '/institutions/me/insights', insights, { role: 'RECRUITER' }],
];
