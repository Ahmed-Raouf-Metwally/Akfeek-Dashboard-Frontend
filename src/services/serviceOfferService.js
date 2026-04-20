import api from './api';

export const serviceOfferService = {
  async list(params = {}) {
    const { data } = await api.get('/admin/service-offers', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load offers');
    return data.data ?? [];
  },
  async create(payload) {
    const { data } = await api.post('/admin/service-offers', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create offer');
    return data.data;
  },
  async remove(id) {
    const { data } = await api.delete(`/admin/service-offers/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete offer');
    return data.data;
  },
};

export default serviceOfferService;

