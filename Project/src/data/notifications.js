import { daysAgo } from './dates';

const note = (id, userId, type, title, message, link, days, read = false) => ({
  id,
  userId,
  type,
  title,
  message,
  link,
  read,
  createdAt: daysAgo(days),
});

export const NOTIFICATIONS = [
  note('ntf_1', 'usr_aarav', 'INTERVIEW', 'Interview scheduled', 'NeuralPulse Labs scheduled a video interview for AI Research & Development Intern.', '/candidate/applications', 0.2),
  note('ntf_2', 'usr_aarav', 'APPLICATION', 'Application under review', 'FinMatrix Global is reviewing your application for Data Analytics & BI Intern.', '/candidate/applications', 2),
  note('ntf_3', 'usr_aarav', 'PROGRAM', 'Workshop coming up', 'Design Systems for Developers starts soon. Check the details in your learning plan.', '/candidate/learning', 3, true),
  note('ntf_4', 'usr_aarav', 'ASSESSMENT', 'Skill verified', 'You earned a verified Advanced level in Communication.', '/candidate/assessments', 21, true),
  note('ntf_5', 'usr_meera', 'PROGRAM', 'New consultancy opportunity', 'NeuralPulse Labs is looking for NLP advisors with Indic-language experience.', '/candidate/academic', 1),
  note('ntf_6', 'usr_org_neuralpulse', 'APPLICATION', 'New application received', 'Aarav Sharma applied for Machine Learning Engineer.', '/recruiter/applications?opportunity=opp_ml_engineer', 0.1),
  note('ntf_7', 'usr_org_neuralpulse', 'APPLICATION', 'New application received', 'Arjun Mehta applied for Associate Data Scientist.', '/recruiter/applications?opportunity=opp_data_scientist', 3),
  note('ntf_8', 'usr_org_neuralpulse', 'SYSTEM', 'Posting expired', 'Data Annotation Lead (Fixed Term) passed its application deadline.', '/recruiter/jobs', 12, true),
  note('ntf_9', 'usr_org_deccan', 'PROGRAM', 'New enrolment', 'Dr. Meera Iyer enrolled in FDP: Teaching Generative AI Responsibly.', '/recruiter/collaborations', 4),
];
