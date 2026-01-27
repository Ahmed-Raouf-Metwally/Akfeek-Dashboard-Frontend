import api from './api';

/**
 * Bookings API. Admin list with server-side pagination.
 * Backend: GET /api/bookings?page&limit&status
 * Returns { success, data, pagination: { page, limit, total, totalPages } }
 */
export const bookingService = {
  async getBookings(params = {}) {
    const { data } = await api.get('/bookings', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load bookings');
    const list = Array.isArray(data.data) ? data.data : [];
    const pagination = data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
    return { list, pagination, message: data.message };
  },
  async getBookingById(id) {
    const { data } = await api.get(`/bookings/${id}`);
    if (!data.success) throw new Error(data.error || 'Booking not found');
    return data.data;
  },
};

export default bookingService;
