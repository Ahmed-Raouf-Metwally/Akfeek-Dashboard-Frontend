import api from './api';

const mobileWorkshopService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/mobile-workshops', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load');
    return { items: data.data ?? [], pagination: data.pagination ?? null };
  },

  getById: async (id) => {
    const { data } = await api.get(`/mobile-workshops/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to load');
    return data.data;
  },

  create: async (payload) => {
    const { data } = await api.post('/mobile-workshops', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create');
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/mobile-workshops/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update');
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/mobile-workshops/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete');
    return data;
  },

  addService: async (workshopId, payload) => {
    const { data } = await api.post(`/mobile-workshops/${workshopId}/services`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to add service');
    return data.data;
  },

  updateService: async (workshopId, svcId, payload) => {
    const { data } = await api.put(`/mobile-workshops/${workshopId}/services/${svcId}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update service');
    return data.data;
  },

  deleteService: async (workshopId, svcId) => {
    const { data } = await api.delete(`/mobile-workshops/${workshopId}/services/${svcId}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete service');
    return data;
  },

  /**
   * رفع صورة: صورة الفني/الشعار (type=logo) أو صورة المركبة (type=vehicle)
   * @param {string} id - Mobile workshop ID
   * @param {File} file - image file
   * @param {'logo'|'vehicle'} type
   */
  uploadImage: async (id, file, type = 'logo') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    const { data } = await api.post(`/mobile-workshops/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!data.success) throw new Error(data.error || 'Failed to upload image');
    return { imageUrl: data.imageUrl, field: data.field };
  },
};

export default mobileWorkshopService;
