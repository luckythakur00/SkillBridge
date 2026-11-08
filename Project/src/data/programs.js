import { daysAgo, daysFromNow } from './dates';

const ALL = ['STUDENT', 'GRADUATE', 'PROFESSIONAL', 'ACADEMICIAN'];
const LEARNERS = ['STUDENT', 'GRADUATE', 'PROFESSIONAL'];
const FACULTY = ['ACADEMICIAN'];

const program = (id, type, organizationId, title, description, audience, skills, mode, location, startInDays, duration, fee, seats, extra = {}) => ({
  id,
  type,
  organizationId,
  title,
  description,
  audience,
  skills,
  mode,
  location,
  startDate: daysFromNow(startInDays),
  duration,
  fee,
  seats,
  deadline: daysFromNow(Math.max(startInDays - 3, 2)),
  status: 'ACTIVE',
  createdAt: daysAgo(14),
  ...extra,
});

const free = null;
const inr = (amount) => ({ amount, currency: 'INR' });

export const PROGRAMS = [
  // Learning and development
  program('prg_cloud_bootcamp', 'TRAINING', 'org_cloudscale', 'Cloud Engineering Bootcamp', 'Eight weeks of hands-on training on containers, CI/CD and AWS, finishing with a deployment project reviewed by CloudScale engineers.', LEARNERS, ['Docker', 'AWS', 'CI/CD', 'Linux'], 'HYBRID', 'Hyderabad, India', 18, '8 weeks', inr(12000), 40),
  program('prg_spring_training', 'TRAINING', 'org_codeforge', 'Java & Spring Boot Developer Track', 'Instructor-led training from Java fundamentals to production-ready REST APIs with Spring Boot and MySQL.', LEARNERS, ['Java', 'Spring Boot', 'MySQL', 'REST APIs'], 'REMOTE', 'Online', 12, '10 weeks', inr(15000), 60),
  program('prg_data_cert', 'CERTIFICATION', 'org_codeforge', 'Certified Data Analyst Program', 'Covers SQL, statistics, and dashboards in Power BI. Includes a proctored final exam and certificate.', LEARNERS, ['SQL', 'Power BI', 'Statistics', 'Excel'], 'REMOTE', 'Online', 9, '6 weeks', inr(9500), 100),
  program('prg_ml_cert', 'CERTIFICATION', 'org_neuralpulse', 'Applied Machine Learning Certificate', 'A project-based certificate taught by NeuralPulse researchers, with three graded model-building projects.', ['STUDENT', 'GRADUATE', 'PROFESSIONAL', 'ACADEMICIAN'], ['Machine Learning', 'Python', 'PyTorch'], 'REMOTE', 'Online', 24, '12 weeks', inr(18000), 50),
  program('prg_react_workshop', 'WORKSHOP', 'org_saasify', 'Design Systems for Developers', 'A one-day workshop on building accessible component libraries with designers and developers working together.', ALL, ['Design Systems', 'React.js', 'Figma'], 'ONSITE', 'Bengaluru, India', 6, '1 day', free, 30),
  program('prg_resume_workshop', 'WORKSHOP', 'org_northbridge', 'Interview & Case Study Masterclass', 'Practise structured interviews and case studies with consultants, and receive individual feedback.', ['STUDENT', 'GRADUATE'], ['Communication', 'Problem Solving'], 'REMOTE', 'Online', 4, '3 hours', free, 150),
  program('prg_firstgen_mentorship', 'MENTORSHIP', 'org_openskills', 'First-Generation Learner Mentorship', 'Six months of one-to-one mentoring with an industry professional, including career planning and interview preparation.', ['STUDENT', 'GRADUATE'], ['Communication', 'Time Management'], 'REMOTE', 'Online', 15, '6 months', free, 80),
  program('prg_ml_mentorship', 'MENTORSHIP', 'org_neuralpulse', 'ML Research Mentorship', 'Monthly guidance from a NeuralPulse researcher on a project or paper of your choice.', ['STUDENT', 'GRADUATE', 'ACADEMICIAN'], ['Machine Learning', 'Research Methods'], 'REMOTE', 'Online', 20, '4 months', free, 12),
  program('prg_live_logistics', 'LIVE_PROJECT', 'org_neuralpulse', 'Route Optimisation Live Project', 'Work in a small team on anonymised delivery data to improve route forecasts, and present results to the product team.', ['STUDENT', 'GRADUATE'], ['Python', 'Machine Learning', 'SQL'], 'REMOTE', 'Online', 10, '10 weeks', free, 15),
  program('prg_live_uav', 'LIVE_PROJECT', 'org_aerodynamics', 'UAV Telemetry Capstone', 'A sponsored capstone building a telemetry dashboard for test flights, with supervision from a professor and an engineer.', ['STUDENT'], ['Embedded C', 'MQTT', 'Sensors'], 'HYBRID', 'Pune, India', 30, '4 months', free, 10, { stipendNote: 'Grant funded: ₹20,000 per month' }),

  // Collaboration with academia
  program('prg_faculty_intern', 'FACULTY_INTERNSHIP', 'org_cloudscale', 'Faculty Summer Internship: Cloud Practice', 'Six weeks embedded with a CloudScale engineering team, to bring current cloud practice back into the classroom.', FACULTY, ['AWS', 'Docker', 'Curriculum Design'], 'ONSITE', 'Hyderabad, India', 40, '6 weeks', free, 6, { stipendNote: 'Honorarium: ₹60,000' }),
  program('prg_industrial_training', 'INDUSTRIAL_TRAINING', 'org_aerodynamics', 'Industrial Training for Engineering Faculty', 'Two weeks of shop-floor and design-lab exposure for mechanical and electronics faculty.', FACULTY, ['CAD', 'Sensors'], 'ONSITE', 'Pune, India', 26, '2 weeks', free, 15),
  program('prg_fdp_ai', 'FDP', 'org_deccan', 'FDP: Teaching Generative AI Responsibly', 'A one-week Faculty Development Program on course design, assessment integrity and hands-on labs for generative AI.', FACULTY, ['Curriculum Design', 'Machine Learning'], 'HYBRID', 'Hyderabad, India', 16, '1 week', inr(2500), 60),
  program('prg_fdp_obe', 'FDP', 'org_narmada', 'FDP: Outcome-Based Education in Practice', 'Practical sessions on mapping courses to outcomes and preparing for accreditation.', FACULTY, ['Curriculum Design'], 'REMOTE', 'Online', 11, '5 days', free, 100),
  program('prg_consultancy_nlp', 'CONSULTANCY', 'org_neuralpulse', 'NLP Advisory for Indic Languages', 'Paid part-time consultancy for faculty with NLP expertise, to guide data collection and model evaluation.', FACULTY, ['NLP', 'Research Methods'], 'REMOTE', 'Online', 22, '3 months', free, 2, { stipendNote: 'Paid per engagement' }),
  program('prg_consultancy_skills', 'CONSULTANCY', 'org_lakshya', 'Vocational Curriculum Review', 'Review and modernise a vocational curriculum in data entry and digital literacy.', FACULTY, ['Curriculum Design'], 'HYBRID', 'Jaipur, India', 35, '2 months', free, 3),
  program('prg_research_bc', 'RESEARCH', 'org_decentratrust', 'Blockchain Security Research Collaboration', 'Joint research on formal verification of smart contracts. Open to faculty and doctoral scholars, with publication support.', ['ACADEMICIAN', 'STUDENT'], ['Cryptography', 'Smart Contracts', 'Research Methods'], 'REMOTE', 'Online', 28, '6 months', free, 4, { stipendNote: 'Grant funded' }),
  program('prg_research_energy', 'RESEARCH', 'org_deccan', 'Industry Research Centre: Smart Grids', 'Collaborate with Deccan Technical University and industry partners on load-forecasting research.', ['ACADEMICIAN', 'PROFESSIONAL'], ['Machine Learning', 'Statistics', 'Research Methods'], 'HYBRID', 'Hyderabad, India', 45, '12 months', free, 8),
  program('prg_guest_ml', 'GUEST_LECTURE', 'org_narmada', 'Guest Lecture Series: AI in Engineering', 'Faculty and industry experts are invited to give a lecture on applied AI to final-year engineering students.', ['ACADEMICIAN', 'PROFESSIONAL'], ['Machine Learning', 'Presentation Skills'], 'ONSITE', 'Indore, India', 13, '1 day', free, 5, { stipendNote: 'Travel covered' }),
  program('prg_challenge_agri', 'INNOVATION_CHALLENGE', 'org_greenfield', 'Smart Farming Innovation Challenge', 'Student and faculty teams propose low-cost irrigation monitoring ideas. Finalists build a pilot with Greenfield engineers.', ALL, ['Sensors', 'Python', 'Problem Solving'], 'HYBRID', 'Nashik, India', 21, '6 weeks', free, 40, { stipendNote: 'Prize fund: ₹1,50,000' }),
  program('prg_guest_cloud', 'GUEST_LECTURE', 'org_lakshya', 'Careers in Technology: Speaker Program', 'Speak to vocational students about pathways into the technology industry.', ['ACADEMICIAN', 'PROFESSIONAL'], ['Communication', 'Presentation Skills'], 'REMOTE', 'Online', 8, '2 hours', free, 10),
];

export const ENROLLMENTS = [
  { id: 'enr_1', programId: 'prg_ml_cert', candidateId: 'cnd_aarav', status: 'ENROLLED', progress: 35, enrolledAt: daysAgo(6) },
  { id: 'enr_2', programId: 'prg_react_workshop', candidateId: 'cnd_aarav', status: 'ENROLLED', progress: 0, enrolledAt: daysAgo(2) },
  { id: 'enr_3', programId: 'prg_fdp_ai', candidateId: 'cnd_meera', status: 'ENROLLED', progress: 0, enrolledAt: daysAgo(4) },
  { id: 'enr_4', programId: 'prg_ml_cert', candidateId: 'cnd_arjun', status: 'ENROLLED', progress: 60, enrolledAt: daysAgo(12) },
  { id: 'enr_5', programId: 'prg_live_logistics', candidateId: 'cnd_ananya', status: 'ENROLLED', progress: 20, enrolledAt: daysAgo(5) },
  { id: 'enr_6', programId: 'prg_consultancy_nlp', candidateId: 'cnd_meera', status: 'ENROLLED', progress: 0, enrolledAt: daysAgo(3) },
];
