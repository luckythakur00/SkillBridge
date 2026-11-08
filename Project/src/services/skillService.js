import { apiClient } from './apiClient';

export const skillService = {
  catalog: () => apiClient.get('/skills'),
  skillMapping: () => apiClient.get('/skill-mapping'),
  assessments: () => apiClient.get('/assessments'),
  assessment: (id) => apiClient.get(`/assessments/${id}`),
  submitAssessment: (id, answers) => apiClient.post(`/assessments/${id}/submit`, { answers }),
  results: () => apiClient.get('/assessments/results/mine'),
};
