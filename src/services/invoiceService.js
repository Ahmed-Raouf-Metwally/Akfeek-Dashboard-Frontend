import api from './api';

/**
 * Invoices API. Admin list with server-side pagination.
 * Backend: GET /api/invoices?page&limit&status
 * Returns { success, data, pagination: { page, limit, total, totalPages } }
 */
export const invoiceService = {
  async getInvoices(params = {}) {
    const { data } = await api.get('/invoices', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load invoices');
    const list = Array.isArray(data.data) ? data.data : [];
    const pagination = data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
    return { list, pagination, message: data.message };
  },
  async getInvoiceById(id) {
    const { data } = await api.get(`/invoices/${id}`);
    if (!data.success) throw new Error(data.error || 'Invoice not found');
    return data.data;
  },
};

export default invoiceService;
