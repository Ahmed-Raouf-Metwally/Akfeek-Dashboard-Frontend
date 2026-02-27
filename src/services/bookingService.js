import api from './api';

/**
 * Bookings API.
 * - Admin: GET /api/bookings (list all)
 * - Customer: GET /api/bookings/my (my appointments), POST /api/bookings (create)
 */
export const bookingService = {
  async getBookings(params = {}) {
    const { data } = await api.get('/bookings', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load bookings');
    const list = Array.isArray(data.data) ? data.data : [];
    const pagination = data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
    return { list, pagination, message: data.message };
  },

  /** Current user's bookings. GET /api/bookings/my?page&limit&status */
  async getMyBookings(params = {}) {
    const { data } = await api.get('/bookings/my', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load bookings');
    const list = Array.isArray(data.data) ? data.data : [];
    const pagination = data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
    return { list, pagination };
  },

  async getBookingById(id) {
    const { data } = await api.get(`/bookings/${id}`);
    if (!data.success) throw new Error(data.error || 'Booking not found');
    return data.data;
  },

  /**
   * Create booking (customer books appointment).
   * Payload: { vehicleId, scheduledDate, scheduledTime?, serviceIds: string[], addressId?, notes? }
   */
  async createBooking(payload) {
    const { data } = await api.post('/bookings', payload);
    if (!data.success) throw new Error(data.error || data.message || 'Failed to create booking');
    return data.data;
  },
};

export default bookingService;
