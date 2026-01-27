import api from './api';

/**
 * Vehicle models API. List is public; create/update/delete require Admin.
 * Backend accepts brandId, name, nameAr, year, size (SMALL|MEDIUM|LARGE|EXTRA_LARGE), imageUrl.
 */
export const modelService = {
  async getModels(params = {}) {
    const { data } = await api.get('/models', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load models');
    return { models: data.data ?? [], meta: data.meta ?? { total: 0 } };
  },

  async getModelById(id) {
    const { data } = await api.get(`/models/${id}`);
    if (!data.success) throw new Error(data.error || 'Model not found');
    return data.data;
  },

  async createModel(payload) {
    const { data } = await api.post('/models', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create model');
    return data.data;
  },

  async updateModel(id, payload) {
    const { data } = await api.patch(`/models/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update model');
    return data.data;
  },

  async deleteModel(id, hardDelete = false) {
    const { data } = await api.delete(`/models/${id}`, { params: { hardDelete } });
    if (!data.success) throw new Error(data.error || 'Failed to delete model');
    return data;
  },
};

export default modelService;
