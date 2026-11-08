// Assembles the seed data. Each entity lives in its own file in this folder.
import { ORGANIZATIONS } from './organizations';
import { SKILLS, CAREER_PATHS } from './skills';
import { ASSESSMENTS } from './assessments';
import { CANDIDATES, ASSESSMENT_RESULTS } from './candidates';
import { OPPORTUNITIES, SAVED_OPPORTUNITIES } from './opportunities';
import { APPLICATIONS } from './applications';
import { PROGRAMS, ENROLLMENTS } from './programs';
import { NOTIFICATIONS } from './notifications';
import { USERS } from './users';

export const createSeedData = () => ({
  users: USERS,
  organizations: ORGANIZATIONS,
  candidates: CANDIDATES,
  skills: SKILLS,
  careerPaths: CAREER_PATHS,
  assessments: ASSESSMENTS,
  assessmentResults: ASSESSMENT_RESULTS,
  opportunities: OPPORTUNITIES,
  savedOpportunities: SAVED_OPPORTUNITIES,
  applications: APPLICATIONS,
  programs: PROGRAMS,
  enrollments: ENROLLMENTS,
  notifications: NOTIFICATIONS,
  newsletter: [],
});
