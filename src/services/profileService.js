import api from './api';

/**
 * Current user profile API.
 * GET /api/users/profile, PUT /api/users/profile, PUT /api/users/language
 */
export const profileService = {
  async getProfile() {
    const { data } = await api.get('/users/profile');
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load profile');
    return data.data;
  },

  async updateProfile(payload) {
    const { data } = await api.put('/users/profile', payload);
    if (!data.success) throw new Error(data.error || data.message || 'Failed to update profile');
    return data.data;
  },

  async updateLanguage(language) {
    const { data } = await api.put('/users/language', { language });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to update language');
    return data.data;
  },
};

export default profileService;
