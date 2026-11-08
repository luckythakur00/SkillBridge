// Enum values match the backend contract in docs/BACKEND_DATABASE_SCHEMA.md.

const toOptions = (labels) => Object.entries(labels).map(([value, label]) => ({ value, label }));

export const ROLES = { CANDIDATE: 'CANDIDATE', RECRUITER: 'RECRUITER' };
export const ROLE_HOME = {
  CANDIDATE: '/candidate/dashboard',
  RECRUITER: '/recruiter/dashboard',
};

export const CANDIDATE_CATEGORY_LABELS = {
  STUDENT: 'Student',
  GRADUATE: 'Fresh Graduate',
  PROFESSIONAL: 'Working Professional',
  ACADEMICIAN: 'Academician / Faculty',
};
export const CANDIDATE_CATEGORIES = toOptions(CANDIDATE_CATEGORY_LABELS);

export const ORGANIZATION_TYPE_LABELS = {
  IT_COMPANY: 'IT Company',
  NON_IT_COMPANY: 'Non-IT Company',
  COLLEGE: 'College',
  UNIVERSITY: 'University',
  EDUCATIONAL_INSTITUTION: 'Educational Institution',
  STARTUP: 'Startup',
  TRAINING_INSTITUTE: 'Training Institute',
  OTHER: 'Other Organization',
};
export const ORGANIZATION_TYPES = toOptions(ORGANIZATION_TYPE_LABELS);

export const VERIFICATION_STATUS = {
  UNVERIFIED: { label: 'Not verified', tone: 'neutral' },
  PENDING: { label: 'Verification pending', tone: 'warning' },
  VERIFIED: { label: 'Verified', tone: 'success' },
};

export const OPPORTUNITY_TYPE_LABELS = { JOB: 'Job', INTERNSHIP: 'Internship' };

export const WORK_MODE_LABELS = { REMOTE: 'Remote', HYBRID: 'Hybrid', ONSITE: 'On-site' };
export const WORK_MODES = toOptions(WORK_MODE_LABELS);

export const EMPLOYMENT_TYPE_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  APPRENTICESHIP: 'Apprenticeship',
};
export const EMPLOYMENT_TYPES = toOptions(EMPLOYMENT_TYPE_LABELS);

export const EXPERIENCE_LEVEL_LABELS = {
  FRESHER: 'Fresher (0 yrs)',
  JUNIOR: '1–2 years',
  MID: '3–5 years',
  SENIOR: '6+ years',
};
export const EXPERIENCE_LEVELS = toOptions(EXPERIENCE_LEVEL_LABELS);

export const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'SGD', label: 'SGD (S$)' },
];
export const PAY_PERIODS = [
  { value: 'MONTH', label: 'per month' },
  { value: 'YEAR', label: 'per year' },
];

// Derived posting state returned by the API: ACTIVE, CLOSED, or EXPIRED once the deadline passes.
export const POSTING_STATE = {
  ACTIVE: { label: 'Active', tone: 'success' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
  EXPIRED: { label: 'Expired', tone: 'warning' },
};

export const APPLICATION_STATUS = {
  APPLIED: { label: 'Applied', tone: 'brand', description: 'Your application was received.' },
  UNDER_REVIEW: { label: 'Under review', tone: 'info', description: 'The recruiter is reviewing your profile.' },
  SHORTLISTED: { label: 'Shortlisted', tone: 'info', description: 'You made the shortlist.' },
  INTERVIEW: { label: 'Interview', tone: 'warning', description: 'An interview is part of the next step.' },
  SELECTED: { label: 'Selected', tone: 'success', description: 'Congratulations, you were selected.' },
  REJECTED: { label: 'Not selected', tone: 'danger', description: 'The recruiter moved ahead with other candidates.' },
  WITHDRAWN: { label: 'Withdrawn', tone: 'neutral', description: 'You withdrew this application.' },
};

// Allowed status moves. The same table is enforced by the mock API and documented for the backend.
export const APPLICATION_TRANSITIONS = {
  APPLIED: ['UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  UNDER_REVIEW: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['SELECTED', 'REJECTED', 'WITHDRAWN'],
  SELECTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};
export const APPLICATION_PIPELINE = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];
export const INTERVIEW_MODES = [
  { value: 'VIDEO', label: 'Video call' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'IN_PERSON', label: 'In person' },
];

export const SKILL_TYPE_LABELS = { TECHNICAL: 'Technical', SOFT: 'Soft skill', APTITUDE: 'Aptitude' };
export const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', rank: 1 },
  { value: 'INTERMEDIATE', label: 'Intermediate', rank: 2 },
  { value: 'ADVANCED', label: 'Advanced', rank: 3 },
  { value: 'EXPERT', label: 'Expert', rank: 4 },
];
export const SKILL_LEVEL_RANK = Object.fromEntries(SKILL_LEVELS.map((l) => [l.value, l.rank]));
export const SKILL_LEVEL_LABEL = Object.fromEntries(SKILL_LEVELS.map((l) => [l.value, l.label]));

export const ASSESSMENT_KIND_LABELS = {
  TECHNICAL: 'Technical',
  SOFT: 'Soft skills',
  APTITUDE: 'Aptitude',
};

export const PROGRAM_TYPE_LABELS = {
  TRAINING: 'Training Program',
  CERTIFICATION: 'Certification Course',
  WORKSHOP: 'Workshop',
  MENTORSHIP: 'Mentorship',
  LIVE_PROJECT: 'Live Industry Project',
  FACULTY_INTERNSHIP: 'Faculty Internship',
  INDUSTRIAL_TRAINING: 'Industrial Training',
  FDP: 'Faculty Development Program',
  CONSULTANCY: 'Consultancy',
  RESEARCH: 'Research Collaboration',
  GUEST_LECTURE: 'Guest Lecture',
  INNOVATION_CHALLENGE: 'Innovation Challenge',
};
export const LEARNING_PROGRAM_TYPES = ['TRAINING', 'CERTIFICATION', 'WORKSHOP', 'MENTORSHIP', 'LIVE_PROJECT'];
export const COLLABORATION_PROGRAM_TYPES = [
  'GUEST_LECTURE',
  'RESEARCH',
  'FDP',
  'FACULTY_INTERNSHIP',
  'INDUSTRIAL_TRAINING',
  'CONSULTANCY',
  'INNOVATION_CHALLENGE',
];
export const PROGRAM_GROUPS = { LEARNING: LEARNING_PROGRAM_TYPES, COLLABORATION: COLLABORATION_PROGRAM_TYPES };
export const programTypeOptions = (group) =>
  PROGRAM_GROUPS[group].map((value) => ({ value, label: PROGRAM_TYPE_LABELS[value] }));

export const NOTIFICATION_TYPES = {
  APPLICATION: 'APPLICATION',
  INTERVIEW: 'INTERVIEW',
  ASSESSMENT: 'ASSESSMENT',
  PROGRAM: 'PROGRAM',
  SYSTEM: 'SYSTEM',
};
