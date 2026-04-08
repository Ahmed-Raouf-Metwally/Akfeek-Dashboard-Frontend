import api from './api';

/**
 * Broadcasts API. Admin list with server-side pagination.
 * Backend: GET /api/broadcasts?page&limit&status&type (type=towing لطلبات الونش فقط)
 * Returns { success, data, pagination: { page, limit, total, totalPages } }
 */
export const broadcastService = {
  async getBroadcasts(params = {}) {
    const { data } = await api.get('/broadcasts', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load broadcasts');
    const list = Array.isArray(data.data) ? data.data : [];
    const pagination = data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
    return { list, pagination, message: data.message };
  },
  async getBroadcastById(id) {
    const { data } = await api.get(`/broadcasts/${id}`);
    if (!data.success) throw new Error(data.error || 'Broadcast not found');
    return data.data;
  },
};

export default broadcastService;
