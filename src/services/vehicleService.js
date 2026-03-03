import api from './api';

/**
 * Vehicle API — admin list/add/edit/delete; brands & models for forms.
 */
export const vehicleService = {
  async getAllVehicles(params = {}) {
    const { data } = await api.get('/vehicles/admin/all', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load vehicles');
    return {
      vehicles: data.data ?? [],
      pagination: data.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 },
    };
  },

  async getVehicleById(id) {
    const { data } = await api.get(`/vehicles/${id}`);
    if (!data.success) throw new Error(data.error || 'Vehicle not found');
    return data.data;
  },

  async createVehicle(payload) {
    const { data } = await api.post('/vehicles', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create vehicle');
    return data.data;
  },

  async updateVehicle(id, payload) {
    const { data } = await api.put(`/vehicles/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update vehicle');
    return data.data;
  },

  async deleteVehicle(id) {
    const { data } = await api.delete(`/vehicles/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete vehicle');
    return data;
  },

  async getBrands() {
    const { data } = await api.get('/vehicles/brands');
    if (!data.success) throw new Error(data.error || 'Failed to load brands');
    return data.data ?? [];
  },

  async getModels(brandId) {
    const { data } = await api.get(`/vehicles/brands/${brandId}/models`);
    if (!data.success) throw new Error(data.error || 'Failed to load models');
    return data.data ?? [];
  },
};

export default vehicleService;
