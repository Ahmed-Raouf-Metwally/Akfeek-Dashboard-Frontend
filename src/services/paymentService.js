import api from './api';

/**
 * Payments API. Admin list with server-side pagination.
 * Backend: GET /api/payments?page&limit&status
 * Returns { success, data, pagination: { page, limit, total, totalPages } }
 */
export const paymentService = {
  async getPayments(params = {}) {
    const { data } = await api.get('/payments', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load payments');
    const list = Array.isArray(data.data) ? data.data : [];
    const pagination = data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
    return { list, pagination, message: data.message };
  },
  async getPaymentById(id) {
    const { data } = await api.get(`/payments/${id}`);
    if (!data.success) throw new Error(data.error || 'Payment not found');
    return data.data;
  },
};

export default paymentService;
