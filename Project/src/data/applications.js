import { daysAgo, daysFromNow } from './dates';
import { computeMatch } from '../utils/skillMatch';
import { APPLICATION_PIPELINE } from '../constants';
import { CANDIDATES } from './candidates';
import { OPPORTUNITIES } from './opportunities';

// Builds a believable timeline: one step every few days, up to the current status.
function buildTimeline(status, appliedDaysAgo) {
  const steps = ['REJECTED', 'WITHDRAWN'].includes(status)
    ? ['APPLIED', 'UNDER_REVIEW', status]
    : APPLICATION_PIPELINE.slice(0, APPLICATION_PIPELINE.indexOf(status) + 1);
  const gap = steps.length > 1 ? Math.floor(appliedDaysAgo / steps.length) : 0;
  return steps.map((step, index) => ({
    status: step,
    at: daysAgo(appliedDaysAgo - gap * index),
    note: null,
  }));
}

const NOTES = {
  APPLIED: 'I have been working on related projects and would welcome the chance to contribute to this team.',
};

const application = (id, opportunityId, candidateId, status, appliedDaysAgo, interview = null, recruiterNote = '') => {
  const candidate = CANDIDATES.find((c) => c.id === candidateId);
  const opportunity = OPPORTUNITIES.find((o) => o.id === opportunityId);
  return {
    id,
    opportunityId,
    candidateId,
    status,
    coverNote: NOTES.APPLIED,
    resume: candidate.resume,
    matchScore: computeMatch(candidate.skills, opportunity.requiredSkills).score,
    appliedAt: daysAgo(appliedDaysAgo),
    updatedAt: daysAgo(1),
    timeline: buildTimeline(status, appliedDaysAgo),
    interview,
    recruiterNote,
    internshipRecord: null,
  };
};

const internshipRecord = (progress, startedDaysAgo, updates) => ({
  progress,
  startedAt: daysAgo(startedDaysAgo),
  completedAt: null,
  updates: updates.map(([note, mentorName, days], index) => ({ id: `upd_${index}`, note, mentorName, progress, at: daysAgo(days) })),
});

const interview = (days, mode, details) => ({
  scheduledAt: daysFromNow(days),
  mode,
  details,
});

export const APPLICATIONS = [
  application('app_01', 'opp_ai_intern', 'cnd_aarav', 'INTERVIEW', 18, interview(3, 'VIDEO', 'Technical round with the research team. A meeting link will be emailed.'), 'Strong ML projects.'),
  application('app_02', 'opp_fullstack', 'cnd_kabir', 'SHORTLISTED', 12),
  application('app_03', 'opp_analytics_intern', 'cnd_aarav', 'UNDER_REVIEW', 9),
  application('app_04', 'opp_uiux_intern', 'cnd_aarav', 'REJECTED', 30),
  application('app_05', 'opp_ml_engineer', 'cnd_aarav', 'APPLIED', 2),

  application('app_06', 'opp_ai_intern', 'cnd_ananya', 'SHORTLISTED', 15, null, 'Excellent vision project.'),
  application('app_07', 'opp_ai_intern', 'cnd_arjun', 'UNDER_REVIEW', 11),
  application('app_08', 'opp_ai_intern', 'cnd_kabir', 'REJECTED', 34),
  application('app_09', 'opp_ai_intern', 'cnd_nisha', 'APPLIED', 4),
  application('app_10', 'opp_ai_intern', 'cnd_priya', 'REJECTED', 28),
  application('app_11', 'opp_ml_engineer', 'cnd_ananya', 'INTERVIEW', 20, interview(5, 'IN_PERSON', 'On-site panel at the Bengaluru office.')),
  application('app_12', 'opp_ml_engineer', 'cnd_arjun', 'SELECTED', 38, null, 'Offer accepted.'),
  application('app_13', 'opp_ml_engineer', 'cnd_rohan', 'UNDER_REVIEW', 7),
  application('app_14', 'opp_ml_engineer', 'cnd_nisha', 'REJECTED', 42),
  application('app_15', 'opp_data_scientist', 'cnd_nisha', 'SHORTLISTED', 22),
  application('app_16', 'opp_data_scientist', 'cnd_sneha', 'INTERVIEW', 25, interview(2, 'VIDEO', 'Case study discussion with the analytics lead.')),
  application('app_17', 'opp_data_scientist', 'cnd_arjun', 'APPLIED', 3),
  application('app_18', 'opp_data_scientist', 'cnd_ananya', 'REJECTED', 48),
  {
    ...application('app_19', 'opp_mlops_intern', 'cnd_vikram', 'SELECTED', 45),
    internshipRecord: internshipRecord(40, 20, [
      ['Containerised the nightly training jobs ahead of schedule.', 'Kavya Menon', 14],
      ['Good progress on alerts. Next, document the deployment runbook.', 'Kavya Menon', 5],
    ]),
  },
  application('app_20', 'opp_mlops_intern', 'cnd_arjun', 'UNDER_REVIEW', 13),
  application('app_21', 'opp_mlops_intern', 'cnd_kabir', 'APPLIED', 6),
  application('app_22', 'opp_annotation_lead', 'cnd_nisha', 'REJECTED', 52),
  application('app_23', 'opp_annotation_lead', 'cnd_sneha', 'SELECTED', 55),

  application('app_24', 'opp_analytics_intern', 'cnd_sneha', 'SHORTLISTED', 8),
  application('app_25', 'opp_designer', 'cnd_fatima', 'INTERVIEW', 10, interview(4, 'VIDEO', 'Portfolio review with the design lead.')),
  application('app_26', 'opp_iot_intern', 'cnd_priya', 'SHORTLISTED', 7),
  application('app_27', 'opp_backend_java', 'cnd_rohan', 'INTERVIEW', 9, interview(6, 'PHONE', 'Initial technical screen.')),
  {
    ...application('app_28', 'opp_blockchain_intern', 'cnd_aarav', 'SELECTED', 40),
    internshipRecord: internshipRecord(60, 26, [
      ['Completed the first smart contract audit with clear findings.', 'Neha Bansal', 12],
      ['Well-written vulnerability report. Second audit starts next week.', 'Neha Bansal', 3],
    ]),
  },
];
