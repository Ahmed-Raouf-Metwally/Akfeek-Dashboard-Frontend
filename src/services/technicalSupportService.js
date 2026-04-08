import api from './api';

/**
 * Technical Support Requests (طلب دعم فني) – Admin dashboard
 */
const technicalSupportService = {
  /**
   * Get tracking info (technician location). GET /api/technical-support-requests/:id/track
   */
  async getTrack(id) {
    const { data } = await api.get(`/technical-support-requests/${id}/track`);
    if (!data.success) throw new Error(data.error || 'Failed to load tracking');
    return data.data;
  },

  /**
   * List technicians for assign dropdown. GET /api/technical-support-requests/technicians
   */
  async getTechnicians() {
    const { data } = await api.get('/technical-support-requests/technicians');
    if (!data.success) throw new Error(data.error || 'Failed to load technicians');
    return data.data ?? [];
  },

  /**
   * List all requests (Admin). GET /api/technical-support-requests/admin/list
   * @param {{ page?: number, limit?: number, status?: string }}
   */
  async getList(params = {}) {
    const { data } = await api.get('/technical-support-requests/admin/list', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load requests');
    return {
      data: data.data ?? [],
      pagination: data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  /**
   * Get single request. GET /api/technical-support-requests/:id
   */
  async getById(id) {
    const { data } = await api.get(`/technical-support-requests/${id}`);
    if (!data.success) throw new Error(data.error || 'Request not found');
    return data.data;
  },

  /**
   * Assign technician. POST /api/technical-support-requests/admin/:id/assign
   * @param {string} id - Request ID
   * @param {{ technicianId: string }}
   */
  async assignTechnician(id, { technicianId }) {
    const { data } = await api.post(`/technical-support-requests/admin/${id}/assign`, { technicianId });
    if (!data.success) throw new Error(data.error || 'Failed to assign technician');
    return data.data;
  },

  /**
   * Update status. PATCH /api/technical-support-requests/admin/:id/status
   * @param {string} id - Request ID
   * @param {{ status?: string, notes?: string }}
   */
  async updateStatus(id, payload) {
    const { data } = await api.patch(`/technical-support-requests/admin/${id}/status`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update status');
    return data.data;
  },
};

export default technicalSupportService;
