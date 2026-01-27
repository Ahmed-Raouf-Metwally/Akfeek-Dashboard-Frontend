import api from './api';

/**
 * Admin settings API.
 * GET /api/admin/settings -> { success, data: { GENERAL: [...], TOWING: [...], ... } }
 * PUT /api/admin/settings/:key -> body: { value }
 */
export const settingsService = {
  async getAll() {
    const { data } = await api.get('/admin/settings');
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load settings');
    return data.data ?? {};
  },

  async update(key, value) {
    const { data } = await api.put(`/admin/settings/${encodeURIComponent(key)}`, { value: String(value) });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to update setting');
    return data.data ?? { key, value };
  },
};

export default settingsService;
