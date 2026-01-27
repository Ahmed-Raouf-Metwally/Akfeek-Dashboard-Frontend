import api from './api';

/**
 * Service catalog API. List is authed; create/update/delete require Admin.
 */
export const serviceService = {
  /**
   * Get services with optional filters.
   * @param {{ category?: string, type?: string, search?: string, isActive?: boolean }}
   */
  async getServices(params = {}) {
    const { data } = await api.get('/services', { params });
    if (!data.success) {
      throw new Error(data.error || 'Failed to load services');
    }
    return data.data ?? [];
  },

  async getServiceById(id) {
    const { data } = await api.get(`/services/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'Service not found');
    }
    return data.data;
  },

  async createService(payload) {
    const { data } = await api.post('/services', payload);
    if (!data.success) {
      throw new Error(data.error || 'Failed to create service');
    }
    return data.data;
  },

  async updateService(id, payload) {
    const { data } = await api.put(`/services/${id}`, payload);
    if (!data.success) {
      throw new Error(data.error || 'Failed to update service');
    }
    return data.data;
  },

  async deleteService(id) {
    const { data } = await api.delete(`/services/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete service');
    }
  },
};

export default serviceService;
