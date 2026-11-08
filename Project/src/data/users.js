import { daysAgo } from './dates';
import { CANDIDATES } from './candidates';
import { ORGANIZATIONS } from './organizations';

// Mock-only accounts. A real backend must store a hash and never return it.
const DEFAULT_PREFERENCES = { emailApplications: true, emailOpportunities: true, emailPrograms: false };

const RECRUITER_CONTACTS = {
  org_neuralpulse: ['talent@neuralpulse.example', 'Kavya Menon'],
  org_deccan: ['industry@deccan.example', 'Prof. Suresh Rao'],
};

export const USERS = [
  ...CANDIDATES.map((candidate) => ({
    id: candidate.userId,
    email: candidate.email,
    password: 'password123',
    role: 'CANDIDATE',
    name: candidate.fullName,
    status: 'ACTIVE',
    preferences: DEFAULT_PREFERENCES,
    createdAt: daysAgo(120),
  })),
  ...ORGANIZATIONS.map((organization) => {
    const [email, name] = RECRUITER_CONTACTS[organization.id] ?? [organization.contactEmail, `${organization.name} Talent Team`];
    return {
      id: `usr_${organization.id}`,
      email,
      password: 'password123',
      role: 'RECRUITER',
      name,
      organizationId: organization.id,
      status: 'ACTIVE',
      preferences: DEFAULT_PREFERENCES,
      createdAt: organization.createdAt,
    };
  }),
];
