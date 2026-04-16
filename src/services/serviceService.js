import api from './api';

/**
 * Service catalog API. List is authed; create/update/delete require Admin.
 */
export const serviceService = {
  /**
   * Upload a service image file. Returns the image URL to use in imageUrl.
   * @param {File} file - Image file (JPEG, PNG, WebP, max 5MB)
   * @returns {Promise<string>} URL path e.g. /uploads/services/service-xxx.jpg
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/services/upload-image', formData);
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.data;
  },

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

  async getCarWashServices() {
    const { data } = await api.get('/services/car-wash');
    if (!data.success) {
      throw new Error(data.error || 'Failed to load car wash services');
    }
    return data.data ?? [];
  },

  async getComprehensiveCareServices() {
    const { data } = await api.get('/services/comprehensive-care');
    if (!data.success) {
      throw new Error(data.error || 'Failed to load comprehensive care services');
    }
    return data.data ?? [];
  },

  async getWorkshopServices() {
    const { data } = await api.get('/services/workshop');
    if (!data.success) {
      throw new Error(data.error || 'Failed to load workshop services');
    }
    return data.data ?? [];
  },

  async getMobileWorkshopServices() {
    const { data } = await api.get('/services/mobile-workshop');
    if (!data.success) {
      throw new Error(data.error || 'Failed to load mobile workshop services');
    }
    return data.data ?? [];
  },

  async getVendorCarWashServices(vendorId) {
    const { data } = await api.get(`/vendors/${vendorId}/car-wash-services`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to load vendor car wash services');
    }
    return data.data ?? [];
  },

  async getVendorServices(vendorId) {
    const { data } = await api.get(`/vendors/${vendorId}/services`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to load vendor services');
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
