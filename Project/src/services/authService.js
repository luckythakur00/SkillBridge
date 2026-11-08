import { apiClient } from './apiClient';

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (payload) => apiClient.post('/auth/register', payload),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  me: () => apiClient.get('/auth/me'),
  changePassword: (payload) => apiClient.post('/auth/change-password', payload),
  updatePreferences: (preferences) => apiClient.patch('/auth/me/preferences', preferences),
  deleteAccount: () => apiClient.delete('/auth/me'),
};
