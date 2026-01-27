import axios from 'axios';
import { API_BASE_URL } from '../config/env';

/**
 * Centralized API client with auth, error handling, and base URL.
 * All API calls should go through this client or services that use it.
 */
export const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

/**
 * Attach token from storage/callback when making requests.
 * Call setAuthToken(token) after login; clear on logout.
 */
let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
}

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Normalize backend error into { message, code, statusCode }.
 * Backend sends: { success: false, error, errorAr, code, details? }
 */
function normalizeError(err) {
  if (err.response?.data && typeof err.response.data === 'object') {
    const d = err.response.data;
    return {
      message: d.error || d.message || 'Request failed',
      messageAr: d.errorAr,
      code: d.code,
      statusCode: err.response.status,
      details: d.details,
    };
  }
  return {
    message: err.message || 'Network or server error',
    code: 'NETWORK_ERROR',
    statusCode: err.response?.status,
  };
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeError(error);
    error.normalized = normalized;
    return Promise.reject(error);
  }
);

export default api;
