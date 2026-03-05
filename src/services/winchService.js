import api from './api';

const winchService = {
  getWinches: async (params = {}) => {
    const { data } = await api.get('/winches', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load winches');
    return { winches: data.data ?? [], pagination: data.pagination ?? null };
  },

  getWinchById: async (id) => {
    const { data } = await api.get(`/winches/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to load winch');
    return data.data;
  },

  createWinch: async (payload) => {
    const { data } = await api.post('/winches', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create winch');
    return data.data;
  },

  updateWinch: async (id, payload) => {
    const { data } = await api.put(`/winches/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update winch');
    return data.data;
  },

  deleteWinch: async (id) => {
    const { data } = await api.delete(`/winches/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete winch');
    return data;
  },

  /**
   * رفع صورة للوينش (Admin)
   * @param {string} id - Winch ID
   * @param {File} file - image file
   * @returns {{ imageUrl: string }}
   */
  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post(`/winches/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!data.success) throw new Error(data.error || 'Failed to upload image');
    return data.imageUrl;
  },
};

export default winchService;
