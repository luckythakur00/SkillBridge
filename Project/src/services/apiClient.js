import { API_BASE_URL, USE_MOCK_API } from '../config/app';
import { ApiError } from './apiError';

let getToken = () => null;
let onUnauthorized = () => {};

// authStore registers these, so this module never has to import a store.
export function configureApiClient(config) {
  getToken = config.getToken;
  onUnauthorized = config.onUnauthorized;
}

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'ALL'),
  );

async function sendToBackend(method, path, { params, body, token }) {
  const isForm = body instanceof FormData;
  const query = new URLSearchParams(cleanParams(params)).toString();
  const response = await fetch(`${API_BASE_URL}${path}${query ? `?${query}` : ''}`, {
    method,
    headers: {
      ...(isForm || !body ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? 'Something went wrong.', data?.fieldErrors ?? null);
  }
  return data;
}

async function sendToMock(method, path, { params, body, token }) {
  // Loaded on demand, so a production build pointed at a real API never downloads the mock data.
  const { handleMockRequest } = await import('../mocks/server');
  return handleMockRequest({ method, path, params: cleanParams(params), body, token });
}

async function request(method, path, { params, body } = {}) {
  const token = getToken();
  try {
    const send = USE_MOCK_API ? sendToMock : sendToBackend;
    return await send(method, path, { params, body, token });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 && token) onUnauthorized();
      throw error;
    }
    console.error(error);
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }
}

export const apiClient = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
};
