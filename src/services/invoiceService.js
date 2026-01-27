import api from './api';

/**
 * Invoices API. Backend may still be "Coming soon".
 */
export const invoiceService = {
  async getInvoices(params = {}) {
    const { data } = await api.get('/invoices', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load invoices');
    return { list: Array.isArray(data.data) ? data.data : [], message: data.message };
  },
};

export default invoiceService;
