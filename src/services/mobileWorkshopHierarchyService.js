import api from './api';

const mobileWorkshopHierarchyService = {
  listCatalogs: async (params = {}) => {
    const { data } = await api.get('/admin/mobile-workshop-hierarchy/catalogs', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load catalogs');
    return data.data ?? [];
  },

  createCatalog: async (payload) => {
    const { data } = await api.post('/admin/mobile-workshop-hierarchy/catalogs', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create catalog');
    return data.data;
  },

  updateCatalog: async (id, payload) => {
    const { data } = await api.put(`/admin/mobile-workshop-hierarchy/catalogs/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update catalog');
    return data.data;
  },

  deleteCatalog: async (id) => {
    const { data } = await api.delete(`/admin/mobile-workshop-hierarchy/catalogs/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete catalog');
    return data.data;
  },

  listCategories: async (catalogId, params = {}) => {
    const { data } = await api.get(`/admin/mobile-workshop-hierarchy/catalogs/${catalogId}/categories`, { params });
    if (!data.success) throw new Error(data.error || 'Failed to load categories');
    return data.data ?? [];
  },

  createCategory: async (catalogId, payload) => {
    const { data } = await api.post(`/admin/mobile-workshop-hierarchy/catalogs/${catalogId}/categories`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to create category');
    return data.data;
  },

  updateCategory: async (id, payload) => {
    const { data } = await api.put(`/admin/mobile-workshop-hierarchy/categories/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update category');
    return data.data;
  },

  deleteCategory: async (id) => {
    const { data } = await api.delete(`/admin/mobile-workshop-hierarchy/categories/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete category');
    return data.data;
  },

  listServices: async (categoryId, params = {}) => {
    const { data } = await api.get(`/admin/mobile-workshop-hierarchy/categories/${categoryId}/services`, { params });
    if (!data.success) throw new Error(data.error || 'Failed to load services');
    return data.data ?? [];
  },

  createService: async (categoryId, payload) => {
    const { data } = await api.post(`/admin/mobile-workshop-hierarchy/categories/${categoryId}/services`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to create service');
    return data.data;
  },

  updateService: async (id, payload) => {
    const { data } = await api.put(`/admin/mobile-workshop-hierarchy/services/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update service');
    return data.data;
  },

  deleteService: async (id) => {
    const { data } = await api.delete(`/admin/mobile-workshop-hierarchy/services/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete service');
    return data.data;
  },
};

export default mobileWorkshopHierarchyService;
