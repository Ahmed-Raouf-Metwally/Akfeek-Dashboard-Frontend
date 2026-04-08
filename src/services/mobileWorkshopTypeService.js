import api from './api';

const mobileWorkshopTypeService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/mobile-workshop-types', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load');
    return data.data ?? [];
  },

  getById: async (id) => {
    const { data } = await api.get(`/mobile-workshop-types/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to load');
    return data.data;
  },

  create: async (payload) => {
    const { data } = await api.post('/mobile-workshop-types', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create');
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/mobile-workshop-types/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update');
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/mobile-workshop-types/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete');
    return data;
  },

  // خدمات نوع الورشة (داخل كل نوع — يضيفها الأدمن)
  getTypeServices: async (typeId) => {
    const { data } = await api.get(`/mobile-workshop-types/${typeId}/services`);
    if (!data.success) throw new Error(data.error || 'Failed to load');
    return data.data ?? [];
  },

  createTypeService: async (typeId, payload) => {
    const { data } = await api.post(`/mobile-workshop-types/${typeId}/services`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to create');
    return data.data;
  },

  updateTypeService: async (typeId, serviceId, payload) => {
    const { data } = await api.put(`/mobile-workshop-types/${typeId}/services/${serviceId}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update');
    return data.data;
  },

  deleteTypeService: async (typeId, serviceId) => {
    const { data } = await api.delete(`/mobile-workshop-types/${typeId}/services/${serviceId}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete');
    return data;
  },
};

export default mobileWorkshopTypeService;
