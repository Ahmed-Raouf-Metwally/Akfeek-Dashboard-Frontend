import api from './api';

/**
 * Products API. Backend may still be "Coming soon".
 */
export const productService = {
  async getProducts(params = {}) {
    const { data } = await api.get('/products', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load products');
    return { list: Array.isArray(data.data) ? data.data : [], message: data.message };
  },
};

export default productService;
