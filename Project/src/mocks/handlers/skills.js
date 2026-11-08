import { getDb, newId } from '../db';
import { candidateOf, notFound, notify, nowIso, serializeOpportunity, serializeProgram } from '../helpers';
import { computeMatch, postingState } from '../../utils/skillMatch';
import { SKILL_LEVEL_LABEL } from '../../constants';

const levelFromScore = (score) => {
  if (score >= 90) return 'EXPERT';
  if (score >= 70) return 'ADVANCED';
  if (score >= 50) return 'INTERMEDIATE';
  return 'BEGINNER';
};

const lower = (name) => name.toLowerCase();

function skillMapping({ user }) {
  const db = getDb();
  const candidate = candidateOf(user);
  const programs = db.programs.filter((p) => postingState(p) === 'ACTIVE');
  const jobs = db.opportunities.filter((o) => !o.deleted && postingState(o) === 'ACTIVE');

  const paths = db.careerPaths
    .map((path) => {
      const match = computeMatch(candidate.skills, path.requiredSkills);
      const gapNames = [...match.missing, ...match.partial].map((s) => lower(s.name));
      const pathNames = path.requiredSkills.map((s) => lower(s.name));
      return {
        ...path,
        readiness: match.score,
        matched: match.matched,
        partial: match.partial,
        missing: match.missing,
        recommendedPrograms: programs
          .filter((p) => p.audience.includes(candidate.category))
          .filter((p) => p.skills.some((name) => gapNames.includes(lower(name))))
          .slice(0, 3)
          .map((p) => serializeProgram(p, candidate)),
        matchingOpportunities: jobs
          .map((o) => ({ o, overlap: o.requiredSkills.filter((s) => pathNames.includes(lower(s.name))).length }))
          .filter(({ overlap }) => overlap >= 2)
          .sort((a, b) => b.overlap - a.overlap)
          .slice(0, 3)
          .map(({ o }) => serializeOpportunity(o, candidate)),
      };
    })
    .sort((a, b) => b.readiness - a.readiness);

  return { paths, skills: candidate.skills };
}

// Answer keys never leave the server.
function publicAssessment(assessment, withQuestions = false) {
  const { questions, ...summary } = assessment;
  return {
    ...summary,
    questionCount: questions.length,
    ...(withQuestions ? { questions: questions.map(({ id, text, options }) => ({ id, text, options })) } : {}),
  };
}

function getAssessment({ params }) {
  const assessment = getDb().assessments.find((a) => a.id === params.id);
  if (!assessment) throw notFound('Assessment');
  return publicAssessment(assessment, true);
}

function submitAssessment({ user, params, body }) {
  const db = getDb();
  const candidate = candidateOf(user);
  const assessment = db.assessments.find((a) => a.id === params.id);
  if (!assessment) throw notFound('Assessment');

  const review = assessment.questions.map((question) => ({
    questionId: question.id,
    selected: body.answers?.[question.id] ?? null,
    correctIndex: question.answer,
    correct: body.answers?.[question.id] === question.answer,
  }));
  const correctCount = review.filter((r) => r.correct).length;
  const score = Math.round((correctCount / assessment.questions.length) * 100);
  const level = levelFromScore(score);
  const passed = score >= 50;

  const result = {
    id: newId('res'),
    assessmentId: assessment.id,
    candidateId: candidate.id,
    score,
    level,
    correctCount,
    totalQuestions: assessment.questions.length,
    takenAt: nowIso(),
  };
  db.assessmentResults.push(result);

  if (passed) {
    const existing = candidate.skills.find((s) => lower(s.name) === lower(assessment.skillName));
    if (existing) {
      existing.level = level;
      existing.verified = true;
    } else {
      candidate.skills.push({ name: assessment.skillName, type: assessment.kind, level, verified: true });
    }
    notify(user.id, 'ASSESSMENT', 'Skill verified', `You earned a verified ${SKILL_LEVEL_LABEL[level]} level in ${assessment.skillName}.`, '/candidate/assessments');
  }

  return { ...result, assessmentTitle: assessment.title, skillName: assessment.skillName, passed, review };
}

function results({ user }) {
  const db = getDb();
  const candidate = candidateOf(user);
  return db.assessmentResults
    .filter((r) => r.candidateId === candidate.id)
    .map((r) => {
      const assessment = db.assessments.find((a) => a.id === r.assessmentId);
      return { ...r, assessmentTitle: assessment?.title, kind: assessment?.kind, skillName: assessment?.skillName };
    })
    .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));
}

export const skillRoutes = [
  ['GET', '/skills', () => getDb().skills],
  ['GET', '/skill-mapping', skillMapping, { role: 'CANDIDATE' }],
  ['GET', '/assessments', () => getDb().assessments.map((a) => publicAssessment(a)), { role: 'CANDIDATE' }],
  ['GET', '/assessments/results/mine', results, { role: 'CANDIDATE' }],
  ['GET', '/assessments/:id', getAssessment, { role: 'CANDIDATE' }],
  ['POST', '/assessments/:id/submit', submitAssessment, { role: 'CANDIDATE' }],
];
