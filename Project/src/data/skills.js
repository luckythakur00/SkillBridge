const group = (type, category, names) => names.map((name) => ({ name, type, category }));

export const SKILLS = [
  ...group('TECHNICAL', 'Programming', ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Rust', 'Embedded C', 'Solidity']),
  ...group('TECHNICAL', 'Web', ['React.js', 'Node.js', 'Spring Boot', 'Next.js', 'Express', 'REST APIs', 'HTML & CSS', 'Tailwind CSS']),
  ...group('TECHNICAL', 'Data & AI', ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Power BI', 'Tableau', 'Excel', 'Statistics', 'Machine Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'OpenCV', 'Pandas', 'Data Visualization']),
  ...group('TECHNICAL', 'Cloud & DevOps', ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Linux', 'Git', 'CI/CD']),
  ...group('TECHNICAL', 'Engineering', ['Raspberry Pi', 'MQTT', 'Sensors', 'CAD', 'MATLAB', 'Smart Contracts', 'Cryptography']),
  ...group('TECHNICAL', 'Design & Product', ['Figma', 'Design Systems', 'User Research', 'Wireframing', 'Product Analytics']),
  ...group('TECHNICAL', 'Academic', ['Curriculum Design', 'Research Methods', 'Technical Writing', 'Grant Writing']),
  ...group('SOFT', 'Workplace', ['Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Time Management', 'Stakeholder Management', 'Presentation Skills', 'Mentoring']),
  ...group('APTITUDE', 'Aptitude', ['Quantitative Aptitude', 'Logical Reasoning']),
];

const req = (name, level) => ({ name, level });

export const CAREER_PATHS = [
  {
    id: 'path_frontend',
    title: 'Frontend Developer',
    description: 'Build responsive, accessible interfaces and component libraries for web products.',
    nextRoles: ['Senior Frontend Engineer', 'UI Architect'],
    salaryBand: '₹6–14 LPA at entry level',
    requiredSkills: [req('JavaScript', 'ADVANCED'), req('React.js', 'ADVANCED'), req('TypeScript', 'INTERMEDIATE'), req('HTML & CSS', 'ADVANCED'), req('Git', 'INTERMEDIATE'), req('REST APIs', 'INTERMEDIATE'), req('Communication', 'INTERMEDIATE')],
  },
  {
    id: 'path_fullstack',
    title: 'Full-Stack Engineer',
    description: 'Deliver complete product features across the interface, services and database.',
    nextRoles: ['Senior Software Engineer', 'Engineering Lead'],
    salaryBand: '₹8–18 LPA at entry level',
    requiredSkills: [req('React.js', 'ADVANCED'), req('Node.js', 'ADVANCED'), req('PostgreSQL', 'INTERMEDIATE'), req('REST APIs', 'ADVANCED'), req('Docker', 'INTERMEDIATE'), req('Git', 'ADVANCED'), req('Problem Solving', 'ADVANCED')],
  },
  {
    id: 'path_backend',
    title: 'Backend Engineer (Java)',
    description: 'Design reliable APIs and data models using Java and Spring Boot.',
    nextRoles: ['Senior Backend Engineer', 'Solutions Architect'],
    salaryBand: '₹7–16 LPA at entry level',
    requiredSkills: [req('Java', 'ADVANCED'), req('Spring Boot', 'ADVANCED'), req('MySQL', 'ADVANCED'), req('REST APIs', 'ADVANCED'), req('Docker', 'INTERMEDIATE'), req('Git', 'INTERMEDIATE')],
  },
  {
    id: 'path_ml',
    title: 'Machine Learning Engineer',
    description: 'Train, evaluate and ship machine learning models into production systems.',
    nextRoles: ['Senior ML Engineer', 'Applied Scientist'],
    salaryBand: '₹10–24 LPA at entry level',
    requiredSkills: [req('Python', 'ADVANCED'), req('Machine Learning', 'ADVANCED'), req('PyTorch', 'INTERMEDIATE'), req('Statistics', 'ADVANCED'), req('SQL', 'INTERMEDIATE'), req('Docker', 'BEGINNER'), req('Communication', 'INTERMEDIATE')],
  },
  {
    id: 'path_data',
    title: 'Data Analyst',
    description: 'Turn business data into dashboards, reports and clear recommendations.',
    nextRoles: ['Senior Analyst', 'Analytics Manager'],
    salaryBand: '₹5–11 LPA at entry level',
    requiredSkills: [req('SQL', 'ADVANCED'), req('Excel', 'ADVANCED'), req('Power BI', 'INTERMEDIATE'), req('Python', 'INTERMEDIATE'), req('Statistics', 'INTERMEDIATE'), req('Presentation Skills', 'INTERMEDIATE')],
  },
  {
    id: 'path_devops',
    title: 'DevOps Engineer',
    description: 'Automate delivery and keep cloud infrastructure dependable.',
    nextRoles: ['Site Reliability Engineer', 'Platform Lead'],
    salaryBand: '₹7–16 LPA at entry level',
    requiredSkills: [req('Linux', 'ADVANCED'), req('Docker', 'ADVANCED'), req('Kubernetes', 'INTERMEDIATE'), req('AWS', 'INTERMEDIATE'), req('CI/CD', 'ADVANCED'), req('Terraform', 'INTERMEDIATE')],
  },
  {
    id: 'path_design',
    title: 'Product Designer',
    description: 'Research user needs and design clear, consistent product experiences.',
    nextRoles: ['Senior Product Designer', 'Design Lead'],
    salaryBand: '₹6–14 LPA at entry level',
    requiredSkills: [req('Figma', 'ADVANCED'), req('User Research', 'INTERMEDIATE'), req('Design Systems', 'INTERMEDIATE'), req('Wireframing', 'ADVANCED'), req('Communication', 'ADVANCED')],
  },
  {
    id: 'path_embedded',
    title: 'Embedded Systems Engineer',
    description: 'Program devices and sensors for automotive, aerospace and IoT products.',
    nextRoles: ['Senior Firmware Engineer', 'Systems Architect'],
    salaryBand: '₹5–13 LPA at entry level',
    requiredSkills: [req('Embedded C', 'ADVANCED'), req('C++', 'INTERMEDIATE'), req('Raspberry Pi', 'INTERMEDIATE'), req('MQTT', 'INTERMEDIATE'), req('Sensors', 'ADVANCED'), req('Linux', 'INTERMEDIATE')],
  },
  {
    id: 'path_academic',
    title: 'Industry-Engaged Academic',
    description: 'Combine teaching and research with consultancy and funded industry projects.',
    nextRoles: ['Principal Investigator', 'Head of Industry Relations'],
    salaryBand: 'Set by institution and grant funding',
    requiredSkills: [req('Research Methods', 'ADVANCED'), req('Curriculum Design', 'ADVANCED'), req('Technical Writing', 'ADVANCED'), req('Grant Writing', 'INTERMEDIATE'), req('Mentoring', 'ADVANCED'), req('Presentation Skills', 'ADVANCED')],
  },
];
