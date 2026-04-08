import api, { setAuthToken, clearAuthToken } from './api';

const AUTH_ME_KEY = 'auth_me';

/**
 * Auth API service.
 * Login uses identifier (email or phone) + password.
 * Responses: { success, data: { user, token } } or { success, data: user } for me.
 */
export const authService = {
  /**
   * Login with email/phone and password.
   * @param {{ identifier: string, password: string }}
   * @returns {{ user, token }}
   */
  async login({ identifier, password }) {
    const { data } = await api.post('/auth/login', { identifier, password });
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Login failed');
    }
    const { user, token } = data.data;
    if (!token) {
      throw new Error('No token returned');
    }
    setAuthToken(token);
    return { user, token };
  },

  /**
   * Get current user. Requires token to be set via setAuthToken before calling.
   * @returns {Promise<object>} user
   */
  async getMe() {
    const { data } = await api.get('/auth/me');
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to load user');
    }
    return data.data;
  },

  /**
   * Logout: clear token only (no backend call).
   */
  logout() {
    clearAuthToken();
  },
};

export default authService;
