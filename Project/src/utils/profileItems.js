// Converts profile entries into the shape used by TimelineList.
export const educationItems = (education = []) =>
  education.map((entry) => ({ id: entry.id, title: entry.institution, subtitle: entry.degree, period: entry.period, detail: entry.score }));

export const experienceItems = (experience = []) =>
  experience.map((entry) => ({ id: entry.id, title: entry.title, subtitle: `${entry.company}${entry.type ? ` · ${entry.type}` : ''}`, period: entry.period, detail: entry.description }));
