import { apiClient } from './apiClient';

export const recruiterService = {
  getOrganization: () => apiClient.get('/organizations/me'),
  updateOrganization: (changes) => apiClient.patch('/organizations/me', changes),
  requestVerification: () => apiClient.post('/organizations/me/verification'),
  getAnalytics: () => apiClient.get('/recruiters/me/analytics'),
  getInstitutionInsights: () => apiClient.get('/institutions/me/insights'),
  searchCandidates: (params) => apiClient.get('/candidates', params),
  getCandidate: (id) => apiClient.get(`/candidates/${id}`),
  getPublicStats: () => apiClient.get('/stats/public'),
  getPublicOrganizations: () => apiClient.get('/organizations'),
  subscribeNewsletter: (email) => apiClient.post('/newsletter', { email }),
};
