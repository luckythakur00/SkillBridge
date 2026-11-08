import { apiClient } from './apiClient';

export const jobService = {
  list: (params) => apiClient.get('/opportunities', params),
  get: (id) => apiClient.get(`/opportunities/${id}`),
  recommended: () => apiClient.get('/opportunities/recommended'),
  saved: () => apiClient.get('/opportunities/saved'),
  save: (id) => apiClient.put(`/opportunities/${id}/save`),
  unsave: (id) => apiClient.delete(`/opportunities/${id}/save`),
  mine: () => apiClient.get('/opportunities/mine'),
  create: (payload) => apiClient.post('/opportunities', payload),
  update: (id, payload) => apiClient.put(`/opportunities/${id}`, payload),
  setStatus: (id, status) => apiClient.patch(`/opportunities/${id}/status`, { status }),
  remove: (id) => apiClient.delete(`/opportunities/${id}`),
};
