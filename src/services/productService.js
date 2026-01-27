import api from './api';

/**
 * Products API. Admin list with server-side pagination.
 * Backend: GET /api/products?page&limit&category&activeOnly
 * Returns { success, data, pagination: { page, limit, total, totalPages } }
 */
export const productService = {
  async getProducts(params = {}) {
    const { data } = await api.get('/products', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load products');
    const list = Array.isArray(data.data) ? data.data : [];
    const pagination = data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
    return { list, pagination, message: data.message };
  },
  async getProductById(id) {
    const { data } = await api.get(`/products/${id}`);
    if (!data.success) throw new Error(data.error || 'Product not found');
    return data.data;
  },
};

export default productService;
