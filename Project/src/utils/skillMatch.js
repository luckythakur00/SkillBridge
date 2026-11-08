import { SKILL_LEVEL_RANK } from '../constants';

const normalize = (name) => name.trim().toLowerCase();
const rank = (level) => SKILL_LEVEL_RANK[level] ?? 1;

/**
 * Compares a candidate's skills with a list of required skills.
 * Each requirement earns 1 point when the level is met, or a share of a point when the
 * candidate has the skill at a lower level. The score is the percentage of points earned.
 * The backend should use this same formula (see docs/BACKEND_DATABASE_SCHEMA.md).
 */
export function computeMatch(candidateSkills = [], requiredSkills = []) {
  const owned = new Map(candidateSkills.map((skill) => [normalize(skill.name), skill]));
  const matched = [];
  const partial = [];
  const missing = [];
  let points = 0;

  requiredSkills.forEach((required) => {
    const have = owned.get(normalize(required.name));
    const needed = rank(required.level);
    if (!have) {
      missing.push(required);
      return;
    }
    const entry = { ...required, currentLevel: have.level, verified: Boolean(have.verified) };
    if (rank(have.level) >= needed) {
      points += 1;
      matched.push(entry);
    } else {
      points += rank(have.level) / needed;
      partial.push(entry);
    }
  });

  const score = requiredSkills.length ? Math.round((points / requiredSkills.length) * 100) : 0;
  return { score, matched, partial, missing };
}

export const matchTone = (score) => (score >= 75 ? 'success' : score >= 50 ? 'brand' : 'neutral');
export const matchLabel = (score) => (score >= 75 ? 'Strong match' : score >= 50 ? 'Good match' : 'Skill gap');

// Readiness items carry a link target, so the dashboard can send people to the right section.
export function profileChecklist(profile) {
  if (!profile) return [];
  const isAcademician = profile.category === 'ACADEMICIAN';
  return [
    {
      key: 'personal',
      label: 'Add your headline, phone and location',
      done: Boolean(profile.headline && profile.phone && profile.location),
      weight: 15,
    },
    {
      key: 'about',
      label: 'Write a short bio',
      done: Boolean(profile.bio),
      weight: 10,
    },
    {
      key: 'education',
      label: 'Add your education',
      done: profile.education?.length > 0,
      weight: 15,
    },
    {
      key: 'skills',
      label: 'List at least 5 skills',
      done: profile.skills?.length >= 5,
      weight: 20,
    },
    {
      key: 'projects',
      label: isAcademician ? 'Add a project or publication' : 'Add a project',
      done: profile.projects?.length > 0,
      weight: 10,
    },
    {
      key: 'experience',
      label: 'Add internship or work experience',
      done: profile.experience?.length > 0,
      weight: 10,
    },
    {
      key: 'resume',
      label: 'Upload your resume',
      done: Boolean(profile.resume),
      weight: 15,
    },
    {
      key: 'links',
      label: 'Add your GitHub or LinkedIn link',
      done: Boolean(profile.github || profile.linkedin),
      weight: 5,
    },
  ];
}

export function profileCompletion(profile) {
  return profileChecklist(profile).reduce((total, item) => total + (item.done ? item.weight : 0), 0);
}

export function postingState(opportunity, today = new Date()) {
  if (opportunity.status === 'CLOSED') return 'CLOSED';
  if (opportunity.deadline) {
    const end = new Date(opportunity.deadline);
    end.setHours(23, 59, 59, 999);
    if (end < today) return 'EXPIRED';
  }
  return 'ACTIVE';
}
