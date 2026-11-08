import { apiClient } from './apiClient';

export const applicationService = {
  apply: (payload) => apiClient.post('/applications', payload),
  mine: () => apiClient.get('/applications/mine'),
  received: (params) => apiClient.get('/applications/received', params),
  withdraw: (id) => apiClient.post(`/applications/${id}/withdraw`),
  updateStatus: (id, payload) => apiClient.patch(`/applications/${id}/status`, payload),
  scheduleInterview: (id, payload) => apiClient.put(`/applications/${id}/interview`, payload),
  updateInternship: (id, payload) => apiClient.patch(`/applications/${id}/internship`, payload),
};
