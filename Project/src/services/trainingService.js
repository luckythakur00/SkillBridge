import { apiClient } from './apiClient';

export const trainingService = {
  list: (params) => apiClient.get('/programs', params),
  mine: () => apiClient.get('/programs/mine'),
  create: (payload) => apiClient.post('/programs', payload),
  update: (id, payload) => apiClient.put(`/programs/${id}`, payload),
  remove: (id) => apiClient.delete(`/programs/${id}`),
  enrollees: (id) => apiClient.get(`/programs/${id}/enrollees`),
  enrollments: () => apiClient.get('/enrollments/mine'),
  enroll: (id) => apiClient.post(`/programs/${id}/enroll`),
  unenroll: (id) => apiClient.delete(`/programs/${id}/enroll`),
};
