import { badRequest, candidateOf, conflict, nowIso } from '../helpers';
import { ApiError } from '../../services/apiError';
import { getDb, newId } from '../db';

const DEFAULT_PREFERENCES = { emailApplications: true, emailOpportunities: true, emailPrograms: false };

function serializeUser(user) {
  const db = getDb();
  const safe = { ...user };
  delete safe.password;
  if (user.role === 'CANDIDATE') {
    const candidate = db.candidates.find((c) => c.userId === user.id);
    return { ...safe, candidateId: candidate?.id, category: candidate?.category };
  }
  const organization = db.organizations.find((o) => o.id === user.organizationId);
  return { ...safe, organizationType: organization?.type, organizationName: organization?.name };
}

const session = (user) => ({ token: `mock.${user.id}`, user: serializeUser(user) });

function login({ body }) {
  const email = String(body.email ?? '').trim().toLowerCase();
  const user = getDb().users.find((u) => u.email.toLowerCase() === email);
  if (!user || user.password !== body.password) {
    throw new ApiError(401, 'Incorrect email or password.');
  }
  if (body.role && user.role !== body.role) {
    const other = user.role === 'CANDIDATE' ? 'Candidate' : 'Recruiter';
    throw new ApiError(403, `This is a ${other} account. Please use the ${other} login.`);
  }
  return session(user);
}

function register({ body }) {
  const db = getDb();
  const email = String(body.email ?? '').trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === email)) {
    throw conflict('An account with this email already exists.');
  }
  if (!['CANDIDATE', 'RECRUITER'].includes(body.role)) throw badRequest('Choose a valid account type.');

  const user = {
    id: newId('usr'),
    email,
    password: body.password,
    role: body.role,
    name: body.name.trim(),
    status: 'ACTIVE',
    preferences: DEFAULT_PREFERENCES,
    createdAt: nowIso(),
  };

  if (body.role === 'CANDIDATE') {
    db.candidates.push({
      id: newId('cnd'),
      userId: user.id,
      category: body.category,
      fullName: user.name,
      email,
      headline: '',
      phone: '',
      location: '',
      university: '',
      degree: '',
      graduationYear: '',
      cgpa: '',
      github: '',
      linkedin: '',
      bio: '',
      portfolioPublic: false,
      skills: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      achievements: [],
      resume: null,
      createdAt: nowIso(),
    });
  } else {
    const organization = {
      id: newId('org'),
      name: body.organizationName.trim(),
      type: body.organizationType,
      industry: '',
      location: '',
      description: '',
      website: '',
      contactEmail: email,
      contactPhone: '',
      size: '',
      foundedYear: '',
      logoUrl: null,
      logoColor: 'bg-brand-600',
      verificationStatus: 'UNVERIFIED',
      createdAt: nowIso(),
    };
    db.organizations.push(organization);
    user.organizationId = organization.id;
  }
  db.users.push(user);
  return session(user);
}

function changePassword({ user, body }) {
  if (user.password !== body.currentPassword) {
    throw badRequest('Your current password is incorrect.', { currentPassword: 'Your current password is incorrect.' });
  }
  user.password = body.newPassword;
  return { success: true };
}

function updatePreferences({ user, body }) {
  user.preferences = { ...user.preferences, ...body };
  return serializeUser(user);
}

function deleteAccount({ user }) {
  const db = getDb();
  if (user.role === 'CANDIDATE') {
    const candidate = candidateOf(user);
    db.candidates = db.candidates.filter((c) => c.id !== candidate.id);
    db.applications = db.applications.filter((a) => a.candidateId !== candidate.id);
    db.enrollments = db.enrollments.filter((e) => e.candidateId !== candidate.id);
    db.savedOpportunities = db.savedOpportunities.filter((s) => s.candidateId !== candidate.id);
    db.assessmentResults = db.assessmentResults.filter((r) => r.candidateId !== candidate.id);
  } else {
    [...db.opportunities, ...db.programs].forEach((item) => {
      if (item.organizationId === user.organizationId) item.status = 'CLOSED';
    });
  }
  db.users = db.users.filter((u) => u.id !== user.id);
  db.notifications = db.notifications.filter((n) => n.userId !== user.id);
  return { success: true };
}

export const authRoutes = [
  ['POST', '/auth/login', login],
  ['POST', '/auth/register', register],
  // Never reveals whether the email exists. The mock sends no email.
  ['POST', '/auth/forgot-password', () => ({ success: true })],
  ['GET', '/auth/me', ({ user }) => serializeUser(user), { role: 'ANY' }],
  ['POST', '/auth/change-password', changePassword, { role: 'ANY' }],
  ['PATCH', '/auth/me/preferences', updatePreferences, { role: 'ANY' }],
  ['DELETE', '/auth/me', deleteAccount, { role: 'ANY' }],
];
