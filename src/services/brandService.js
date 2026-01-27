import api from './api';

/**
 * Vehicle brands API. List is public; create/update/delete require Admin.
 */
export const brandService = {
  async getBrands(params = {}) {
    const q = { ...params };
    if (typeof q.activeOnly === 'boolean') q.activeOnly = String(q.activeOnly);
    const { data } = await api.get('/brands', { params: q });
    if (!data.success) throw new Error(data.error || 'Failed to load brands');
    return { brands: data.data ?? [], meta: data.meta ?? { total: 0 } };
  },

  async getBrandById(id) {
    const { data } = await api.get(`/brands/${id}`);
    if (!data.success) throw new Error(data.error || 'Brand not found');
    return data.data;
  },

  async createBrand(payload) {
    const { data } = await api.post('/brands', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create brand');
    return data.data;
  },

  async updateBrand(id, payload) {
    const { data } = await api.patch(`/brands/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update brand');
    return data.data;
  },

  async deleteBrand(id, hardDelete = false) {
    const { data } = await api.delete(`/brands/${id}`, { params: { hardDelete } });
    if (!data.success) throw new Error(data.error || 'Failed to delete brand');
    return data;
  },
};

export default brandService;
