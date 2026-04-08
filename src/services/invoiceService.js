import api from './api';

/**
 * Invoices API.
 * - Admin: GET /api/invoices?page&limit&status
 * - Vendor: GET /api/invoices/vendor/mine?page&limit&status (فواتير الفيندور فقط)
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
  /** Vendor: list invoices for current vendor only (bookings linked to their workshop/services/winch). */
  async getMyInvoicesAsVendor(params = {}) {
    const { data } = await api.get('/invoices/vendor/mine', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load invoices');
    const list = Array.isArray(data.data) ? data.data : [];
    const pagination = data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
    return { list, pagination, message: data.message };
  },
  /**
   * Get invoice by ID. For tax invoice display, backend should include:
   * - vendor (or booking.workshop.vendor) with businessName, businessNameAr, taxNumber, contactEmail, contactPhone, address, city, country, commercialLicense
   * - customer, lineItems, booking
   */
  async getInvoiceById(id) {
    const { data } = await api.get(`/invoices/${id}`);
    if (!data.success) throw new Error(data.error || 'Invoice not found');
    return data.data;
  },
  /** Vendor: get single invoice by id (must belong to current vendor). */
  async getInvoiceByIdForVendor(id) {
    const { data } = await api.get(`/invoices/vendor/mine/${id}`);
    if (!data.success) throw new Error(data.error || 'Invoice not found');
    return data.data;
  },
};

export default invoiceService;
