import api from './api';

export const autoPartService = {
  /**
   * Get auto parts with filters.
   */
  async getAutoParts(params = {}) {
    const { data } = await api.get('/auto-parts', { params });
    if (!data.success) {
      throw new Error(data.error || 'Failed to load auto parts');
    }
    return data.data;
  },

  /**
   * Get auto part by ID.
   */
  async getAutoPartById(id) {
    const { data } = await api.get(`/auto-parts/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to load auto part details');
    }
    return data.data;
  },

  /**
   * Get parts by vendor.
   */
  async getPartsByVendor(vendorId) {
    const { data } = await api.get(`/auto-parts/vendor/${vendorId}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to load vendor parts');
    }
    return data.data;
  },

  /**
   * Get parts by vehicle model.
   */
  async getPartsByVehicle(vehicleModelId) {
    const { data } = await api.get(`/auto-parts/vehicle/${vehicleModelId}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to load compatible parts');
    }
    return data.data;
  },

  /**
   * Create auto part.
   */
  async createAutoPart(payload) {
    const { data } = await api.post('/auto-parts', payload);
    if (!data.success) {
      throw new Error(data.error || 'Failed to create auto part');
    }
    return data.data;
  },

  /**
   * Update auto part.
   */
  async updateAutoPart(id, payload) {
    const { data } = await api.put(`/auto-parts/${id}`, payload);
    if (!data.success) {
      throw new Error(data.error || 'Failed to update auto part');
    }
    return data.data;
  },

  /**
   * Update approval status (Admin).
   */
  async updatePartApproval(id, isApproved) {
    const { data } = await api.put(`/auto-parts/${id}/approve`, { isApproved });
    if (!data.success) {
      throw new Error(data.error || 'Failed to update approval status');
    }
    return data.data;
  },

  /**
   * Delete auto part.
   */
  async deleteAutoPart(id) {
    const { data } = await api.delete(`/auto-parts/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete auto part');
    }
    return data;
  },

  /**
   * Add images to part.
   */
  async addPartImages(id, images) {
    const { data } = await api.post(`/auto-parts/${id}/images`, { images });
    if (!data.success) {
      throw new Error(data.error || 'Failed to add images');
    }
    return data.data;
  },

  /**
   * Update stock.
   */
  async updatePartStock(id, quantity) {
    const { data } = await api.put(`/auto-parts/${id}/stock`, { quantity });
    if (!data.success) {
      throw new Error(data.error || 'Failed to update stock');
    }
    return data.data;
  }
};

export default autoPartService;
