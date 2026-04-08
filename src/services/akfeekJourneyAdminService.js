import api from './api';

/**
 * Admin: رحلات خدمة أكفيك — GET /api/admin/akfeek-journey
 */
export const akfeekJourneyAdminService = {
  async list(params = {}) {
    const { data } = await api.get('/admin/akfeek-journey', { params });
    if (!data.success) {
      throw new Error(data.error || data.message || 'Failed to load Akfeek journeys');
    }
    const payload = data.data || {};
    const { items = [], total = 0, page = 1, limit = 20 } = payload;
    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
    return {
      list: items,
      pagination: { page, limit, total, totalPages },
    };
  },

  async getById(journeyId) {
    const { data } = await api.get(`/admin/akfeek-journey/${journeyId}`);
    if (!data.success) {
      throw new Error(data.error || data.message || 'Failed to load journey');
    }
    return data.data;
  },

  async downloadDocumentFile(journeyId, documentId) {
    const { data } = await api.get(`/admin/akfeek-journey/${journeyId}/documents/${documentId}/file`, {
      responseType: 'blob',
    });
    return data;
  },
};

export default akfeekJourneyAdminService;
