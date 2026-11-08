import { getDb, newId } from '../db';
import { candidateOf, conflict, forbidden, includesText, notFound, notify, nowIso, organizationOf, serializeProgram, viewerCandidate } from '../helpers';
import { postingState } from '../../utils/skillMatch';
import { PROGRAM_GROUPS } from '../../constants';

function listPrograms({ params, user }) {
  const candidate = viewerCandidate(user);
  const query = (params.q ?? '').trim().toLowerCase();
  const groupTypes = params.group ? PROGRAM_GROUPS[params.group] : null;
  return getDb().programs
    .filter((p) => postingState(p) === 'ACTIVE')
    .filter((p) => !params.type || p.type === params.type)
    .filter((p) => !groupTypes || groupTypes.includes(p.type))
    .filter((p) => !params.audience || p.audience.includes(params.audience))
    .filter((p) => !query || includesText(p.title, query) || p.skills.some((s) => includesText(s, query)))
    .map((p) => serializeProgram(p, candidate))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

function ownProgram(user, id) {
  const organization = organizationOf(user);
  const program = getDb().programs.find((p) => p.id === id);
  if (!program) throw notFound('Program');
  if (program.organizationId !== organization.id) throw forbidden('This program belongs to another organization.');
  return program;
}

function mine({ user }) {
  const organization = organizationOf(user);
  return getDb().programs
    .filter((p) => p.organizationId === organization.id)
    .map((p) => serializeProgram(p))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function create({ user, body }) {
  const organization = organizationOf(user);
  const program = { ...body, id: newId('prg'), organizationId: organization.id, status: 'ACTIVE', createdAt: nowIso() };
  getDb().programs.push(program);
  return serializeProgram(program);
}

function update({ user, params, body }) {
  const program = ownProgram(user, params.id);
  Object.assign(program, body, { id: program.id, organizationId: program.organizationId, createdAt: program.createdAt });
  return serializeProgram(program);
}

function remove({ user, params }) {
  const db = getDb();
  const program = ownProgram(user, params.id);
  db.enrollments.filter((e) => e.programId === program.id).forEach((e) => {
    const candidate = db.candidates.find((c) => c.id === e.candidateId);
    if (candidate) notify(candidate.userId, 'PROGRAM', 'Program cancelled', `${program.title} is no longer running.`, '/candidate/learning');
  });
  db.enrollments = db.enrollments.filter((e) => e.programId !== program.id);
  db.programs = db.programs.filter((p) => p.id !== program.id);
  return { success: true };
}

function enrollees({ user, params }) {
  const db = getDb();
  const program = ownProgram(user, params.id);
  return db.enrollments
    .filter((e) => e.programId === program.id)
    .map((e) => {
      const candidate = db.candidates.find((c) => c.id === e.candidateId);
      return { ...e, candidate: candidate && { id: candidate.id, fullName: candidate.fullName, headline: candidate.headline, category: candidate.category } };
    });
}

function myEnrollments({ user }) {
  const db = getDb();
  const candidate = candidateOf(user);
  return db.enrollments
    .filter((e) => e.candidateId === candidate.id)
    .map((e) => {
      const program = db.programs.find((p) => p.id === e.programId);
      return program ? { ...e, program: serializeProgram(program, candidate) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.program.startDate) - new Date(b.program.startDate));
}

function enroll({ user, params }) {
  const db = getDb();
  const candidate = candidateOf(user);
  const program = db.programs.find((p) => p.id === params.id);
  if (!program) throw notFound('Program');
  if (postingState(program) !== 'ACTIVE') throw conflict('Registration for this program has closed.');
  const enrolled = db.enrollments.filter((e) => e.programId === program.id);
  if (enrolled.some((e) => e.candidateId === candidate.id)) throw conflict('You are already registered for this program.');
  if (enrolled.length >= program.seats) throw conflict('This program is full.');
  const enrollment = { id: newId('enr'), programId: program.id, candidateId: candidate.id, status: 'ENROLLED', progress: 0, enrolledAt: nowIso() };
  db.enrollments.push(enrollment);
  const recruiter = db.users.find((u) => u.organizationId === program.organizationId);
  if (recruiter) notify(recruiter.id, 'PROGRAM', 'New registration', `${candidate.fullName} registered for ${program.title}.`, '/recruiter/programs');
  return { ...enrollment, program: serializeProgram(program, candidate) };
}

function unenroll({ user, params }) {
  const db = getDb();
  const candidate = candidateOf(user);
  db.enrollments = db.enrollments.filter((e) => !(e.programId === params.id && e.candidateId === candidate.id));
  return { success: true };
}

export const programRoutes = [
  ['GET', '/programs/mine', mine, { role: 'RECRUITER' }],
  ['GET', '/programs', listPrograms],
  ['POST', '/programs', create, { role: 'RECRUITER' }],
  ['PUT', '/programs/:id', update, { role: 'RECRUITER' }],
  ['DELETE', '/programs/:id', remove, { role: 'RECRUITER' }],
  ['GET', '/programs/:id/enrollees', enrollees, { role: 'RECRUITER' }],
  ['POST', '/programs/:id/enroll', enroll, { role: 'CANDIDATE' }],
  ['DELETE', '/programs/:id/enroll', unenroll, { role: 'CANDIDATE' }],
  ['GET', '/enrollments/mine', myEnrollments, { role: 'CANDIDATE' }],
];
