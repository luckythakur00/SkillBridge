import { apiClient } from './apiClient';

export const candidateService = {
  getProfile: () => apiClient.get('/candidates/me'),
  updateProfile: (changes) => apiClient.patch('/candidates/me', changes),
  // section: education | experience | projects | certifications | achievements
  addItem: (section, item) => apiClient.post(`/candidates/me/${section}`, item),
  updateItem: (section, id, item) => apiClient.put(`/candidates/me/${section}/${id}`, item),
  removeItem: (section, id) => apiClient.delete(`/candidates/me/${section}/${id}`),
  addSkill: (skill) => apiClient.post('/candidates/me/skills', skill),
  removeSkill: (name) => apiClient.delete(`/candidates/me/skills/${encodeURIComponent(name)}`),
  uploadResume: (file) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post('/candidates/me/resume', form);
  },
  removeResume: () => apiClient.delete('/candidates/me/resume'),
  getPortfolio: (candidateId) => apiClient.get(`/portfolios/${candidateId}`),
};
